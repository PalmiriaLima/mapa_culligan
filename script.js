
const pontos = [
  { nome: "DAZU PURIFICADORES", cep: "60040-000" },
  { nome: "PADIZON REFRIGERAÇÃO", cep: "58030-000" },
  { nome: "CASA DOS FILTROS", cep: "77062-020" },
  { nome: "OFICINA DO ESPRESSO", cep: "30360-090" },
  { nome: "TECNICOS CULLIGAN", cep: "05424-070" },
  { nome: "TECNICOS CULLIGAN", cep: "40020-000" },
  { nome: "TECNICOS CULLIGAN", cep: "48280-000" },
  { nome: "GRUPO C&D", cep: "80230-020" },
  { nome: "HOMETECH", cep: "88301-668" },
  { nome: "EDMILSON", cep: "57045-838" },
  { nome: "EDUARDO", cep: "73753-064" },
  { nome: "SANFILTROS", cep: "86060-000" },
  { nome: "ERCOMFRIO", cep: "78900-970" },
  { nome: "OESTE RIO", cep: "21241-051" },
  { nome: "LOJÃO DOS FILTROS", cep: "49045-970" },
  { nome: "START REFRIGERAÇÃO", cep: "29150-240" }
];

const estadosComAtendimento = [
  "Ceará", "Paraíba", "Tocantins", "Minas Gerais", "São Paulo",
  "Bahia", "Paraná", "Santa Catarina", "Alagoas", "Distrito Federal",
  "Rondônia", "Rio de Janeiro", "Sergipe", "Espírito Santo"
];

const map = L.map('map', {
  zoomControl: true,
  minZoom: 4,
  maxZoom: 16,
  maxBounds: [[-35, -75], [7, -30]]
});

map.fitBounds([[-33.75, -73.99], [5.27, -34.79]]);

// Mapa claro
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>',
}).addTo(map);

// Estados com atendimento
fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => ({
        color: "#004080",
        weight: 1
      }),
      onEachFeature: (feature, layer) => {
        const nomeEstado = feature.properties.name;
        const siglas = {
          "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM", "Bahia": "BA",
          "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES", "Goiás": "GO",
          "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG",
          "Pará": "PA", "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI",
          "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS",
          "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC", "São Paulo": "SP",
          "Sergipe": "SE", "Tocantins": "TO"
        };

        const sigla = siglas[nomeEstado] || nomeEstado;
        const centro = layer.getBounds().getCenter();

        const label = L.tooltip({
          permanent: true,
          direction: "center",
          className: "estado-label"
        }).setContent(sigla).setLatLng(centro);

        map.addLayer(label);
        layer.bindPopup(nomeEstado);
      }
    }).addTo(map);
  });

async function getLatLng(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await response.json();
  if (!data.erro) {
    const endereco = `${data.logradouro || ''}, ${data.localidade}, ${data.uf}`;
    const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`);
    const geoData = await geoResp.json();
    if (geoData.length > 0) {
      return {
        lat: parseFloat(geoData[0].lat),
        lng: parseFloat(geoData[0].lon)
      };
    }
  }
  return null;
}

async function verificarDistancia() {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  if (!cep) return;

  const userLocation = await getLatLng(cep);
  if (!userLocation) {
    document.getElementById('resultado').innerText = 'CEP inválido ou não encontrado';
    return;
  }

  let encontrado = false;
  for (const ponto of pontos) {
    const pontoLatLng = await getLatLng(ponto.cep);
    if (!pontoLatLng) continue;

    const distance = map.distance(userLocation, pontoLatLng) / 1000;
    if (distance <= 70) {
      document.getElementById('resultado').innerText = `Cobertura disponível: ${ponto.nome} está a ${distance.toFixed(2)} km.`;
      L.circle(userLocation, { radius: 70000, color: "blue", fillOpacity: 0.1 }).addTo(map);
      L.marker(userLocation).addTo(map).bindPopup("Você está aqui").openPopup();
      L.marker(pontoLatLng).addTo(map).bindPopup(ponto.nome);
      map.setView(userLocation, 10);
      encontrado = true;
      break;
    }
  }

  if (!encontrado) {
    document.getElementById('resultado').innerText = 'Nenhum ponto de atendimento encontrado em até 70 km.';
  }
}

async function verTodosPontos() {
  map.fitBounds([[-33.75, -73.99], [5.27, -34.79]]);
  for (const ponto of pontos) {
    const pontoLatLng = await getLatLng(ponto.cep);
    if (pontoLatLng) {
      L.marker(pontoLatLng).addTo(map).bindPopup(ponto.nome);
    }
  }
}
