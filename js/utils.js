// Вспомогательные функции
export const ChessUtils = {
    // Конвертация шахматной нотации в индексы
    notationToIndices: (notation) => {
        const col = notation.charCodeAt(0) - 97;
        const row = 8 - parseInt(notation[1]);
        return { row, col };
    },
    
    // Конвертация индексов в шахматную нотацию
    indicesToNotation: (row, col) => {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return `${file}${rank}`;
    },
    
    // Проверка, находится ли позиция в пределах доски
    isValidPosition: (row, col) => {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },
    
    // Символы фигур Unicode
    PIECE_SYMBOLS: {
        white: {
            king: '♔',
            queen: '♕',
            rook: '♖',
            bishop: '♗',
            knight: '♘',
            pawn: '♙'
        },
        black: {
            king: '♚',
            queen: '♛',
            rook: '♜',
            bishop: '♝',
            knight: '♞',
            pawn: '♟'
        }
    },
    
    // Получить символ фигуры
    getPieceSymbol: (piece) => {
        if (!piece) return '';
        return ChessUtils.PIECE_SYMBOLS[piece.color][piece.type];
    }
};a
