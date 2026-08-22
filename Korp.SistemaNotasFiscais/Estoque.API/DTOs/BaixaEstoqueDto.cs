namespace Estoque.API.DTOs
{
    public class BaixaEstoqueDto
    {
        public string CodigoProduto { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }
}