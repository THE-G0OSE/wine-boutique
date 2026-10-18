import { RouterProvider as ReactRouterProvider } from 'react-router/dom'
import { router } from '../model/routerConfig'

const RouterProvider = () => {
  return <ReactRouterProvider router={router} />
}

export default RouterProvider
