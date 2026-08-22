using System.ComponentModel.DataAnnotations;

namespace Faturamento.API.Models
{
    public class NotaFiscal
    {
        public int Id { get; set; }

        // A numeração sequencial exigida pelo teste
        public int NumeroSequencial { get; set; }

        public StatusNota Status { get; set; } = StatusNota.Aberta; // Status inicial

        // Relacionamento 1 para N (Inclusão de múltiplos produtos)
        public List<ItemNotaFiscal> Itens { get; set; } = new List<ItemNotaFiscal>();
    }
}