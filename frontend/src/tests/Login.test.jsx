import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import axios from 'axios'
import Login from '../paginas/Login.jsx'

vi.mock('axios')

describe('Pruebas Login Botica Salud', () => {

  test('debe mostrar error cuando las credenciales son incorrectas', async () => {

    axios.post.mockRejectedValue({
      response: {
        status: 401
      }
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    fireEvent.change(
      screen.getByPlaceholderText('Ingrese su correo'),
      {
        target: {
          value: 'admin@farmacia.com'
        }
      }
    )

    fireEvent.change(
      screen.getByPlaceholderText('Ingrese su contrasena'),
      {
        target: {
          value: 'claveIncorrecta'
        }
      }
    )

    fireEvent.click(
      screen.getByText('Ingresar')
    )

    expect(
      await screen.findByText(/correo o contrasena incorrectos/i)
    ).toBeInTheDocument()

  })

})