using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Faturamento.API.Models
{
    public class ItemNotaFiscal
    {
        public int Id { get; set; }

        [Required]
        public string CodigoProduto { get; set; } = string.Empty;

        [Required]
        public int Quantidade { get; set; }

        public int NotaFiscalId { get; set; }

        [JsonIgnore] // Evita loop infinito ao serializar o JSON no Swagger
        public NotaFiscal? NotaFiscal { get; set; }
    }
}