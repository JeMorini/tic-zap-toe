import { createCanvas } from "canvas";

export class TicTacToeImage {
  constructor(size = 300) {
    this.size = size;
    this.cellSize = this.size / 3;
    this.canvas = createCanvas(this.size, this.size);
    this.ctx = this.canvas.getContext("2d");
  }

  drawGrid() {
    console.log("CHEGOOOOOOUUUUUUUUUU");

    const { ctx, size, cellSize } = this;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;

    for (let i = 1; i < 3; i++) {
      const x = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }

    for (let i = 1; i < 3; i++) {
      const y = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  drawSymbols(board) {
    console.log("CHEGOOOOOOUUUUUUUUUU");
    const { ctx, cellSize } = this;

    ctx.font = `${cellSize / 2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const symbol = board[row][col];
        if (symbol) {
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          ctx.fillStyle =
            symbol === "X" ? "#ff0000" : symbol === "O" ? "#0000ff" : "#000000";
          ctx.fillText(symbol, x, y);
        }
      }
    }
  }

  public checkWinner(board) {
    // Verifica linhas, colunas e diagonais para um vencedor
    const lines = [
      // Linhas
      [board[0][0], board[0][1], board[0][2]],
      [board[1][0], board[1][1], board[1][2]],
      [board[2][0], board[2][1], board[2][2]],
      // Colunas
      [board[0][0], board[1][0], board[2][0]],
      [board[0][1], board[1][1], board[2][1]],
      [board[0][2], board[1][2], board[2][2]],
      // Diagonais
      [board[0][0], board[1][1], board[2][2]],
      [board[0][2], board[1][1], board[2][0]],
    ];

    for (let line of lines) {
      if (line[0] === line[1] && line[1] === line[2] && line[0] !== "") {
        return line[0]; // Retorna o vencedor ("X" ou "O")
      }
    }

    return null; // Sem vencedor
  }

  public isTie(board) {
    // Verifica se há algum espaço vazio ou número ainda disponível
    for (let row of board) {
      for (let cell of row) {
        if (!isNaN(cell)) {
          return false; // Ainda há jogadas disponíveis
        }
      }
    }
    return true; // Tabuleiro cheio
  }

  async generateImage(board) {
    console.log("CHEGOOOOOOUUUUUUUUUU");
    this.drawGrid();
    this.drawSymbols(board);
    const buffer = this.canvas.toBuffer("image/png");

    return buffer;
  }
}
