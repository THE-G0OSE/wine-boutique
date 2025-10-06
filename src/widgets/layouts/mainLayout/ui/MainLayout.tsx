import { Header } from './components/header'
import { type FC, type ReactNode } from 'react'

interface IProps {
    children: ReactNode
}

const MainLayout: FC<IProps> = ({children}) => {
  return (
    <div className="relative w-[100vw] min-h-[100vh] overflow-x-hidden overflow-y-scroll">
        {children}
        <Header/> 
    </div>
  )
}

export default MainLayout