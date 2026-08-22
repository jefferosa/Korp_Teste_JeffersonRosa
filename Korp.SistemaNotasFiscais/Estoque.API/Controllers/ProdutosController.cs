using Estoque.API.Data;
using Estoque.API.DTOs;
using Estoque.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Estoque.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutosController : ControllerBase
    {
        private readonly EstoqueDbContext _context;

        public ProdutosController(EstoqueDbContext context)
        {
            _context = context;
        }

        // GET: api/produtos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
        {
            // O requisito pede o uso de LINQ. 
            // Aqui usamos LINQ para ordenar a lista alfabeticamente direto no banco.
            var produtos = await _context.Produtos
                .OrderBy(p => p.Descricao)
                .ToListAsync();

            return Ok(produtos);
        }

        // POST: api/produtos
        [HttpPost]
        public async Task<ActionResult<Produto>> PostProduto(Produto produto)
        {
            // Mais uma aplicação de LINQ: AnyAsync para verificar duplicidade de forma performática.
            bool codigoExiste = await _context.Produtos
                .AnyAsync(p => p.Codigo == produto.Codigo);

            if (codigoExiste)
            {
                return BadRequest(new { mensagem = "Já existe um produto cadastrado com este código." });
            }

            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            // Retorna o status 201 Created com os dados do produto salvo
            return CreatedAtAction(nameof(GetProdutos), new { id = produto.Id }, produto);
        }

        // PUT: api/produtos/baixar-estoque
        [HttpPut("baixar-estoque")]
        public async Task<IActionResult> BaixarEstoque([FromBody] List<BaixaEstoqueDto> itens)
        {
            foreach (var item in itens)
            {
                var produto = await _context.Produtos.FirstOrDefaultAsync(p => p.Codigo == item.CodigoProduto);

                if (produto == null)
                    return NotFound($"Produto {item.CodigoProduto} não encontrado.");

                if (produto.Saldo < item.Quantidade)
                    return BadRequest($"Saldo insuficiente para o produto {produto.Codigo}.");

                produto.Saldo -= item.Quantidade;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("Concorrência detectada: o saldo foi modificado por outra transação.");
            }

            return Ok();
        }
    }
}