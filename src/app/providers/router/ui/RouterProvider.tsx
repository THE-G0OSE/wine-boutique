import {BrowserRouter, Route, Routes} from 'react-router'
import { routes } from '../model/routerConfig'

const RouterProvider = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => <Route path={route.path} element={route.element}/>)}
      </Routes>
    </BrowserRouter>
  )
}

export default RouterProvider