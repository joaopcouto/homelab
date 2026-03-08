import app from "./app.ts";

const PORT = 3333;

app.listen(3333, "0.0.0.0", () => {
  console.log("Servidor rodando na porta 3333");
});

// Keep process alive hack
setInterval(() => {}, 10000);
