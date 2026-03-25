import { ChessUtils } from './utils.js';

// Базовый класс фигуры
export class Piece {
    constructor(color, type, position) {
        this.color = color;
        this.type = type;
        this.position = position;
    }
    
    getValidMoves(board, currentPosition) {
        return [];
    }
    
    clone() {
        return new Piece(this.color, this.type, { ...this.position });
    }
}

// Пешка
export class Pawn extends Piece {
    constructor(color, position) {
        super(color, 'pawn', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;
        const { row, col } = currentPosition;
        
        // Ход на 1 клетку вперед
        const newRow = row + direction;
        if (ChessUtils.isValidPosition(newRow, col) && !board.getPiece(newRow, col)) {
            moves.push({ row: newRow, col });
            
            // Ход на 2 клетки из начальной позиции
            const twoStepsRow = row + (direction * 2);
            if (row === startRow && !board.getPiece(twoStepsRow, col) && !board.getPiece(newRow, col)) {
                moves.push({ row: twoStepsRow, col });
            }
        }
        
        // Взятие по диагонали
        const captureCols = [col - 1, col + 1];
        for (const captureCol of captureCols) {
            const captureRow = row + direction;
            if (ChessUtils.isValidPosition(captureRow, captureCol)) {
                const targetPiece = board.getPiece(captureRow, captureCol);
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push({ row: captureRow, col: captureCol });
                }
            }
        }
        
        return moves;
    }
}

// Ладья
export class Rook extends Piece {
    constructor(color, position) {
        super(color, 'rook', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = currentPosition.row + rowDir;
            let newCol = currentPosition.col + colDir;
            
            while (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
}

// Конь
export class Knight extends Piece {
    constructor(color, position) {
        super(color, 'knight', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [rowMove, colMove] of knightMoves) {
            const newRow = currentPosition.row + rowMove;
            const newCol = currentPosition.col + colMove;
            
            if (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece || piece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
}

// Слон
export class Bishop extends Piece {
    constructor(color, position) {
        super(color, 'bishop', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = currentPosition.row + rowDir;
            let newCol = currentPosition.col + colDir;
            
            while (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
}

// Ферзь
export class Queen extends Piece {
    constructor(color, position) {
        super(color, 'queen', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = currentPosition.row + rowDir;
            let newCol = currentPosition.col + colDir;
            
            while (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
}

// Король
export class King extends Piece {
    constructor(color, position) {
        super(color, 'king', position);
    }
    
    getValidMoves(board, currentPosition) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [rowMove, colMove] of kingMoves) {
            const newRow = currentPosition.row + rowMove;
            const newCol = currentPosition.col + colMove;
            
            if (ChessUtils.isValidPosition(newRow, newCol)) {
                const piece = board.getPiece(newRow, newCol);
                if (!piece || piece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
}
