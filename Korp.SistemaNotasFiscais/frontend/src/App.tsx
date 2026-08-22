import { useState } from 'react'

function App() {
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [saldo, setSaldo] = useState<number | ''>('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensagem('')
    setErro('')

    try {
      // IMPORTANTE: Confirme se a porta do seu Estoque.API é realmente a 5192. 
      // Caso seja outra, altere a URL abaixo.
      const response = await fetch('http://localhost:5192/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo,
          descricao,
          saldo: Number(saldo)
        })
      })

      if (response.ok) {
        setMensagem('Produto cadastrado com sucesso!')
        setCodigo('')
        setDescricao('')
        setSaldo('')
      } else {
        const errorData = await response.text()
        setErro(errorData || 'Erro ao cadastrar o produto.')
      }
    } catch (error) {
      setErro('Erro de conexão. Verifique se a API de Estoque está rodando e se o CORS está habilitado.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Cadastro de Produto</h2>

        {mensagem && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">{mensagem}</div>}
        {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">{erro}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código do Produto</label>
            <input
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: PRD-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Teclado Mecânico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
            <input
              type="number"
              required
              min="0"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Cadastrar Produto
          </button>
        </form>
      </div>
    </div>
  )
}

export default App