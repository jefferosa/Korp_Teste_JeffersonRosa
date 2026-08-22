using System.ComponentModel.DataAnnotations;

namespace Faturamento.API.DTOs
{
    public class CriarItemDto
    {
        [Required]
        public string CodigoProduto { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero.")]
        public int Quantidade { get; set; }
    }

    public class CriarNotaFiscalDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "A nota fiscal deve conter pelo menos um produto.")]
        public List<CriarItemDto> Itens { get; set; } = new List<CriarItemDto>();
    }
}