function verificarCEP() {
  const cep = document.getElementById('cepInput').value;
  const resultado = document.getElementById('resultado');

  // Exemplo fictício de validação (substituir por lógica real ou API)
  const cepsAtendidos = ['60000-000', '60100-000', '60200-000'];
  if (cepsAtendidos.includes(cep)) {
    resultado.textContent = "✅ Região atendida!";
    resultado.style.color = "green";
  } else {
    resultado.textContent = "❌ Região fora da área de cobertura.";
    resultado.style.color = "red";
  }
}
