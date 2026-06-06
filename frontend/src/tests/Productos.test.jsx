import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import ProductoFormulario from '../componentes/ProductoFormulario.jsx'

vi.mock('axios')

describe('Pruebas modulo de inventario - Botica Salud', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    axios.get.mockResolvedValue({
      data: []
    })
  })

  test('debe registrar un producto desde la vista de nuevo producto', async () => {
    axios.post.mockResolvedValue({
      data: {
        id: 1,
        nombre: 'Acetaminofen',
        categoria: 'Medicamento',
        costo: 20,
        precio: 25,
        cantidad: 30,
        presentacionVenta: 'Unidad',
        unidadesPorPresentacion: 1,
        proveedor: 'Proveedor Central'
      }
    })

    render(
      <MemoryRouter>
        <ProductoFormulario modo="crear" />
      </MemoryRouter>
    )

    fireEvent.change(await screen.findByPlaceholderText(/^Nombre$/i), {
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

    fireEvent.click(screen.getByRole('button', { name: /guardar producto/i }))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          nombre: 'Acetaminofen',
          categoria: 'Medicamento',
          costo: 20,
          precio: 25,
          cantidad: 30,
          presentacionVenta: 'Unidad',
          unidadesPorPresentacion: 1,
          proveedor: 'Proveedor Central'
        })
      )
    })
  })
})
