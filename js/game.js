import { Board } from './board.js';
import { ChessUtils } from './utils.js';
import { Pawn, Rook, Knight, Bishop, Queen, King } from './pieces.js';

class Game {
    constructor() {
        this.board = new Board();
        this.currentTurn = 'white'; // Белые ходят первыми
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.checkStatus = false;
        
        this.init();
    }
    
    init() {
        this.board.setupInitialPosition();
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
    }
    
    renderBoard() {
        const boardElement = document.getElementById('chessBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                const isLight = (row + col) % 2 === 0;
                const cell = document.createElement('div');
                cell.className = `cell ${isLight ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Отображаем фигуру
                if (piece) {
                    cell.textContent = ChessUtils.getPieceSymbol(piece);
                }
                
                // Подсветка выбранной фигуры
                if (this.selectedPosition && 
                    this.selectedPosition.row === row && 
                    this.selectedPosition.col === col) {
                    cell.classList.add('selected');
                }
                
                // Подсветка возможных ходов
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    const targetPiece = this.board.getPiece(row, col);
                    if (targetPiece && targetPiece.color !== this.currentTurn) {
                        cell.classList.add('highlight-capture');
                    } else {
                        cell.classList.add('highlight-move');
                    }
                }
                
                // Подсветка шаха
                if (this.checkStatus) {
                    const kingPiece = this.findKing(this.currentTurn);
                    if (kingPiece && kingPiece.row === row && kingPiece.col === col) {
                        cell.classList.add('check');
                    }
                }
                
                boardElement.appendChild(cell);
            }
        }
        
        // Добавляем координаты
        this.addCoordinates();
    }
    
    addCoordinates() {
        // Добавляем координаты через псевдоэлементы в CSS
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const notation = ChessUtils.indicesToNotation(row, col);
            cell.setAttribute('data-coord', notation);
        });
    }
    
    setupEventListeners() {
        const boardElement = document.getElementById('chessBoard');
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.handleCellClick(row, col);
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoMove();
        });
    }
    
    handleCellClick(row, col) {
        // Если есть выбранная фигура
        if (this.selectedPiece) {
            // Проверяем, является ли клик возможным ходом
            const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);
            
            if (isValidMove) {
                this.makeMove(this.selectedPosition.row, this.selectedPosition.col, row, col);
                this.clearSelection();
            } else {
                // Если кликнули на другую свою фигуру
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === this.currentTurn) {
                    this.selectPiece(row, col);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // Выбираем фигуру
            const piece = this.board.getPiece(row, col);
            if (piece && piece.color === this.currentTurn && !this.gameOver) {
                this.selectPiece(row, col);
            }
        }
    }
    
    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) return;
        
        this.selectedPiece = piece;
        this.selectedPosition = { row, col };
        
        // Получаем все возможные ходы
        const allMoves = piece.getValidMoves(this.board, { row, col });
        
        // Фильтруем ходы, которые оставляют короля под шахом
        this.validMoves = allMoves.filter(move => {
            return !this.wouldBeInCheck(piece, move.row, move.col);
        });
        
        this.renderBoard();
    }
    
    wouldBeInCheck(piece, toRow, toCol) {
        // Клонируем доску и делаем пробный ход
        const testBoard = this.board.clone();
        const fromRow = piece.position.row;
        const fromCol = piece.position.col;
        
        // Получаем фигуру на клоне
        const testPiece = testBoard.getPiece(fromRow, fromCol);
        const capturedPiece = testBoard.getPiece(toRow, toCol);
        
        // Делаем ход на клоне
        testBoard.setPiece(toRow, toCol, testPiece);
        testBoard.setPiece(fromRow, fromCol, null);
        
        if (testPiece) {
            testPiece.position = { row: toRow, col: toCol };
        }
        
        // Находим короля
        const kingPosition = this.findKingOnBoard(piece.color, testBoard);
        if (!kingPosition) return true;
        
        // Проверяем, атакован ли король
        return testBoard.isSquareAttacked(kingPosition.row, kingPosition.col, piece.color);
    }
    
    findKingOnBoard(color, board) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    findKing(color) {
        return this.findKingOnBoard(color, this.board);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board.getPiece(fromRow, fromCol);
        if (!piece) return false;
        
        // Сохраняем информацию о взятии
        const capturedPiece = this.board.getPiece(toRow, toCol);
        
        // Делаем ход
        this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        // Проверяем, не остался ли король под шахом
        const kingPosition = this.findKing(this.currentTurn);
        if (this.board.isSquareAttacked(kingPosition.row, kingPosition.col, this.currentTurn)) {
            // Отменяем ход
            this.board.undoMove();
            this.showMessage('Нельзя оставлять короля под шахом!');
            return false;
        }
        
        // Обновляем захваченные фигуры
        this.updateCapturedPieces(capturedPiece);
        
        // Проверяем шах и мат
        this.checkStatus = this.isCheck(this.currentTurn === 'white' ? 'black' : 'white');
        
        // Проверяем мат
        if (this.isCheckmate()) {
            this.gameOver = true;
            this.winner = this.currentTurn === 'white' ? 'black' : 'white';
            this.showMessage(`${this.winner === 'white' ? 'Белые' : 'Черные'} победили! Мат!`);
            this.renderBoard();
            return true;
        }
        
        // Смена хода
        this.switchTurn();
        
        // Проверяем шах для нового игрока
        this.checkStatus = this.isCheck(this.currentTurn);
        if (this.checkStatus) {
            this.showMessage('Шах!');
        }
        
        this.renderBoard();
        this.updateUI();
        
        return true;
    }
    
    isCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition) return false;
        return this.board.isSquareAttacked(kingPosition.row, kingPosition.col, color);
    }
    
    isCheckmate() {
        // Проверяем, есть ли у текущего игрока легальные ходы
        const pieces = this.board.getAllPieces();
        const currentColor = this.currentTurn;
        
        for (const { piece, position } of pieces) {
            if (piece.color === currentColor) {
                const moves = piece.getValidMoves(this.board, position);
                const legalMoves = moves.filter(move => {
                    return !this.wouldBeInCheck(piece, move.row, move.col);
                });
                
                if (legalMoves.length > 0) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    switchTurn() {
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    }
    
    clearSelection() {
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.validMoves = [];
        this.renderBoard();
    }
    
    updateUI() {
        const currentPlayerElement = document.querySelector('.current-player');
        const turnIndicator = document.querySelector('.turn-color-indicator');
        
        currentPlayerElement.textContent = this.currentTurn === 'white' ? 'Белые' : 'Черные';
        turnIndicator.className = `turn-color-indicator ${this.currentTurn}-turn`;
        
        if (this.gameOver) {
            const statusMessage = document.querySelector('.status-message');
            statusMessage.textContent = `Игра окончена! ${this.winner === 'white' ? 'Белые' : 'Черные'} победили!`;
        }
    }
    
    showMessage(message) {
        const statusMessage = document.querySelector('.status-message');
        statusMessage.textContent = message;
        setTimeout(() => {
            if (!this.gameOver) {
                statusMessage.textContent = '';
            }
        }, 2000);
    }
    
    updateCapturedPieces(capturedPiece) {
        if (!capturedPiece) return;
        
        const symbol = ChessUtils.getPieceSymbol(capturedPiece);
        const container = capturedPiece.color === 'white' ? 
            '.captured-white' : '.captured-black';
        
        const capturedContainer = document.querySelector(container);
        const pieceSpan = document.createElement('span');
        pieceSpan.textContent = symbol;
        pieceSpan.style.fontSize = '1.5rem';
        capturedContainer.appendChild(pieceSpan);
    }
    
    resetGame() {
        this.board = new Board();
        this.board.setupInitialPosition();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.selectedPosition = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.checkStatus = false;
        
        // Очищаем захваченные фигуры
        document.querySelector('.captured-white').innerHTML = '';
        document.querySelector('.captured-black').innerHTML = '';
        document.querySelector('.status-message').textContent = '';
        
        this.renderBoard();
        this.updateUI();
    }
    
    undoMove() {
        if (this.gameOver) return;
        
        const undone = this.board.undoMove();
        if (undone) {
            this.switchTurn();
            this.clearSelection();
            this.checkStatus = this.isCheck(this.currentTurn);
            this.renderBoard();
            this.updateUI();
        }
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
