using Estoque.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Adiciona os serviços ao contêiner.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Registrando o contexto do banco de dados (SQLite)
builder.Services.AddDbContext<EstoqueDbContext>(options =>
    options.UseSqlite("Data Source=estoque.db"));

var app = builder.Build();

// Configura o pipeline de requisições HTTP (Swagger)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

// Mapeia os controllers (como o ProdutosController) para receberem as rotas
app.MapControllers();

// A linha mais importante: manda a API rodar e escutar a porta
app.Run();