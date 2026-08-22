using System.Text;
using System.Text.Json;

namespace Faturamento.API.Services
{
    // DTO apenas para enviar os dados de baixa para o Estoque
    public class BaixaEstoqueDto
    {
        public string CodigoProduto { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }

    public class EstoqueService
    {
        private readonly HttpClient _httpClient;

        public EstoqueService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> BaixarEstoqueAsync(List<BaixaEstoqueDto> itens)
        {
            var json = JsonSerializer.Serialize(itens);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                // Faz a chamada PUT para o Serviço de Estoque (que criaremos no próximo passo)
                var response = await _httpClient.PutAsync("/api/produtos/baixar-estoque", content);

                // O Polly (que configuraremos no Program.cs) vai tentar novamente caso a rede falhe.
                // Se mesmo assim falhar, retornamos false para o Controller tratar amigavelmente.
                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException)
            {

                // Se após todas as tentativas do Polly a API de Estoque continuar fora do ar,
                // o C# lança essa exceção. Nós a capturamos e retornamos false amigavelmente.
                return false;
            }
        }
    }
}