import { Navigate, useParams } from 'react-router-dom'
import ProyectoPilates from '../components/ProyectoPilates'
import ProyectoEditorial from '../components/ProyectoEditorial'
import { getProjectCategory, getProject } from '../data/proyectos'

export default function ProyectoDetalle() {
  const { categoria, slug } = useParams()
  const category = getProjectCategory(categoria)
  const project = getProject(categoria, slug)

  if (!category || !project) {
    return <Navigate to="/proyectos" replace />
  }

  if (project.template === 'reportaje' || project.slug === 'centro-de-pilates') {
    return <ProyectoPilates project={project} />
  }

  return <ProyectoEditorial project={project} />
}