import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import Productos from '../componentes/Productos.jsx'

vi.mock('axios')

describe('Pruebas Módulo de Inventario - Botica Salud', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    axios.get.mockResolvedValue({
      data: []
    })
  })

  test('debe registrar un producto correctamente', async () => {
    axios.post.mockResolvedValue({
      data: {
        id: 1,
        nombre: 'Acetaminofen',
        categoria: 'Medicamento',
        costo: 20,
        precio: 25,
        cantidad: 30,
        proveedor: 'Proveedor Central'
      }
    })

    render(<Productos />)

    fireEvent.change(screen.getByPlaceholderText(/^Nombre$/i), {
  target: { value: 'Acetaminofen' }
})

fireEvent.change(screen.getByPlaceholderText(/^Categoria$/i), {
  target: { value: 'Medicamento' }
})

fireEvent.change(screen.getByPlaceholderText(/^Costo$/i), {
  target: { value: '20' }
})

fireEvent.change(screen.getByPlaceholderText(/^Precio$/i), {
  target: { value: '25' }
})

fireEvent.change(screen.getByPlaceholderText(/^Cantidad$/i), {
  target: { value: '30' }
})

fireEvent.change(screen.getByPlaceholderText(/^Proveedor$/i), {
  target: { value: 'Proveedor Central' }
})

    fireEvent.click(screen.getByText(/guardar producto/i))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled()
    })

    expect(await screen.findByText(/producto guardado correctamente/i))
      .toBeInTheDocument()
  })
})