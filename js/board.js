import { ChessUtils } from './utils.js';
import { Pawn, Rook, Knight, Bishop, Queen, King } from './pieces.js';

export class Board {
    constructor() {
        this.cells = this.initializeBoard();
        this.history = [];
    }
    
    initializeBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                board[row][col] = null;
            }
        }
        return board;
    }
    
    setupInitialPosition() {
        // Очищаем доску
        this.cells = this.initializeBoard();
        
        // Расставляем пешки
        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', { row: 1, col });
            this.cells[6][col] = new Pawn('white', { row: 6, col });
        }
        
        // Расставляем остальные фигуры
        const backRow = [
            Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook
        ];
        
        for (let col = 0; col < 8; col++) {
            const BlackPieceClass = backRow[col];
            const WhitePieceClass = backRow[col];
            this.cells[0][col] = new BlackPieceClass('black', { row: 0, col });
            this.cells[7][col] = new WhitePieceClass('white', { row: 7, col });
        }
    }
    
    getPiece(row, col) {
        if (!ChessUtils.isValidPosition(row, col)) return null;
        return this.cells[row][col];
    }
    
    setPiece(row, col, piece) {
        if (piece) {
            piece.position = { row, col };
        }
        this.cells[row][col] = piece;
    }
    
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;
        
        const capturedPiece = this.getPiece(toRow, toCol);
        
        // Сохраняем в историю
        this.history.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece
        });
        
        // Перемещаем фигуру
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        // Превращение пешки
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.promotePawn(toRow, toCol, piece.color);
        }
        
        return true;
    }
    
    promotePawn(row, col, color) {
        // Превращаем пешку в ферзя
        this.setPiece(row, col, new Queen(color, { row, col }));
    }
    
    undoMove() {
        if (this.history.length === 0) return false;
        
        const lastMove = this.history.pop();
        
        // Восстанавливаем фигуры
        this.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
        this.setPiece(lastMove.to.row, lastMove.to.col, lastMove.captured);
        
        return true;
    }
    
    getAllPieces() {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    pieces.push({
                        piece,
                        position: { row, col }
                    });
                }
            }
        }
        return pieces;
    }
    
    clone() {
        const newBoard = new Board();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) {
                    let newPiece;
                    switch(piece.type) {
                        case 'pawn': newPiece = new Pawn(piece.color, { row, col }); break;
                        case 'rook': newPiece = new Rook(piece.color, { row, col }); break;
                        case 'knight': newPiece = new Knight(piece.color, { row, col }); break;
                        case 'bishop': newPiece = new Bishop(piece.color, { row, col }); break;
                        case 'queen': newPiece = new Queen(piece.color, { row, col }); break;
                        case 'king': newPiece = new King(piece.color, { row, col }); break;
                    }
                    newBoard.setPiece(row, col, newPiece);
                }
            }
        }
        return newBoard;
    }
    
    isSquareAttacked(row, col, color) {
        // Проверяем, атакована ли клетка фигурами противоположного цвета
        const oppositeColor = color === 'white' ? 'black' : 'white';
        const pieces = this.getAllPieces();
        
        for (const { piece, position } of pieces) {
            if (piece.color === oppositeColor) {
                const moves = piece.getValidMoves(this, position);
                if (moves.some(move => move.row === row && move.col === col)) {
                    return true;
                }
            }
        }
        return false;
    }
}
