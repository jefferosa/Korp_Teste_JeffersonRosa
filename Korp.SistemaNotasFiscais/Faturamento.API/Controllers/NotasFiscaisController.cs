using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Faturamento.API.Data;
using Faturamento.API.Models;
using Faturamento.API.DTOs;

namespace Faturamento.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotasFiscaisController : ControllerBase
    {
        private readonly FaturamentoDbContext _context;

        public NotasFiscaisController(FaturamentoDbContext context)
        {
            _context = context;
        }

        // POST: api/notasfiscais
        [HttpPost]
        public async Task<ActionResult<NotaFiscal>> PostNotaFiscal(CriarNotaFiscalDto dto)
        {
            // O requisito pede numeração sequencial. 
            // Usamos LINQ para descobrir o último número gerado e somar 1.
            int ultimoNumero = await _context.NotasFiscais
                .MaxAsync(n => (int?)n.NumeroSequencial) ?? 0;

            var notaFiscal = new NotaFiscal
            {
                NumeroSequencial = ultimoNumero + 1,
                // O requisito obriga o status inicial como Aberta
                Status = StatusNota.Aberta,
                // Mapeando o DTO para a Entidade que vai para o banco
                Itens = dto.Itens.Select(i => new ItemNotaFiscal
                {
                    CodigoProduto = i.CodigoProduto,
                    Quantidade = i.Quantidade
                }).ToList()
            };

            _context.NotasFiscais.Add(notaFiscal);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotaFiscal), new { id = notaFiscal.Id }, notaFiscal);
        }

        // GET: api/notasfiscais/{id}
        // Este endpoint é necessário para o retorno do CreatedAtAction acima
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaFiscal>> GetNotaFiscal(int id)
        {
            // Usando LINQ (Include) para trazer os itens junto com a nota
            var notaFiscal = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notaFiscal == null)
            {
                return NotFound();
            }

            return Ok(notaFiscal);
        }

        // POST: api/notasfiscais/{id}/imprimir
        [HttpPost("{id}/imprimir")]
        public async Task<IActionResult> Imprimir(int id, [FromServices] Services.EstoqueService estoqueService)
        {
            var nota = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (nota == null) return NotFound("Nota fiscal não encontrada.");

            // Regra de negócio: apenas notas Abertas podem ser impressas
            if (nota.Status != StatusNota.Aberta)
                return BadRequest("Apenas notas com status 'Aberta' podem ser impressas.");

            var itensBaixa = nota.Itens.Select(i => new Services.BaixaEstoqueDto
            {
                CodigoProduto = i.CodigoProduto,
                Quantidade = i.Quantidade
            }).ToList();

            // Comunicação HTTP com resiliência (Polly)
            var sucesso = await estoqueService.BaixarEstoqueAsync(itensBaixa);

            if (!sucesso)
                return StatusCode(503, "O Serviço de Estoque está indisponível ou o saldo é insuficiente. Tente novamente mais tarde.");

            // Atualiza o status para Fechada após o sucesso da baixa
            nota.Status = StatusNota.Fechada;
            await _context.SaveChangesAsync();

            return Ok(nota);
        }
    }
}