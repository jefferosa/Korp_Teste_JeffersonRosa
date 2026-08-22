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

                if (!response.IsSuccessStatusCode)
                {
                    var erroDetalhado = await response.Content.ReadAsStringAsync();
                    throw new Exception(string.IsNullOrWhiteSpace(erroDetalhado) ? "Erro ao baixar estoque." : erroDetalhado);
                }
                
                return true;
            }
            catch (HttpRequestException)
            {
                // Se a API de Estoque estiver totalmente fora do ar
                throw new Exception("O Serviço de Estoque está indisponível no momento.");
            }
        }
    }
}