import React, { useState,useContext, useEffect, } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Nabvar from "../Nabvar";
import { Separator } from "../ui/separator";
import { Badge} from "../ui/badge";
import { Progress} from "../ui/progress";
import { Calendar } from '../ui/calendar';
import { AuthContext } from '../../context/AuthProvider';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

import TableProjects from './TableProjects';



function ProjectDetails() {
    const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const [project, setProject] = useState(null); // Cambia esta línea
  const [completed, setCompleted] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [delayed, setDelayed] = useState(0);
  const location = useLocation();
  useEffect(() => {
    async function fetchProjectData() {
      try {
        const projectResponse = await fetch(`http://localhost:5000/api/projects/${id}`);
        if (!projectResponse.ok) {
          throw new Error('Error al obtener el proyecto');
        }
        const projectData = await projectResponse.json();
        console.log("Project Data:", projectData);  // Verifica los datos
   
        setProject(projectData);
   
        const statusResponse = await fetch(`http://localhost:5000/api/estado-participantes/${id}`);
        if (!statusResponse.ok) {
          throw new Error('Error al obtener el estado de los participantes');
        }
        const statusData = await statusResponse.json();
        console.log("Status Data:", statusData);  // Verifica la estructura de los datos
   
        // Asignar los valores de estado a las variables correspondientes
        const completedStatus = statusData.find(item => item.estado === 'Completado');
        const inProgressStatus = statusData.find(item => item.estado === 'En Proceso');
        const delayedStatus = statusData.find(item => item.estado === 'Retrasado');
   
        setCompleted(completedStatus ? completedStatus.cantidad_participantes : 0);
        setInProgress(inProgressStatus ? inProgressStatus.cantidad_participantes : 0);
        setDelayed(delayedStatus ? delayedStatus.cantidad_participantes : 0);
   
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    }
   
    fetchProjectData();

  }, [id]);
    if (!project || typeof project !== 'object') {
    return <p>No hay datos del proyecto. Debes recargar desde la API.</p>;
    }

  // tengo el total_participantes y  este deberia ser el en proceso, cuando uno de los participantes completa las 30 preguntas pasa a estar completado y si la persona no a completado las 30 preguntas en la fecha destinada de termino del proyecto pasaria a estar retrazada 
  // si el proyecto tiene 30 preguntas la persona contesta 15 entonces la tabla deberia actualizarse a completas 15 y deberia restarle 15 al total de preguntas y si la persona se equivoca en algunas preguntas deberia actualzarse a respuestas erroneas

  return (

    <div className='min-h-screen bg-background'>
        <Nabvar />
        <main className='max-w-5xl mx-auto px-4 py-12'>
            <div className='grid gap-8 lg:grid-cols-[1fr,280px]'>
                <div className='space-y-8'>

                    <div className='flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between'>
                        <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-2xl font-medium tracking-tight'>{project.name}</h1>
                                <Badge variant="secondary">En Proceso</Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>{project.description}</p>
                        </div>
                        <div className='relative  w-24 h-24 shrink-0 overflow-hidden rounded-lg border'>
                            <img src={`http://localhost:5000${project.img}`} alt={project.name} className='object-cover' />
                        </div>
                    </div>
                    <Separator />
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-sm font-medium'>Progreso del Proyecto</h2>
                            <span className='text-sm text-muted-foreground'>65%</span>
                        </div>
                        <Progress value={65} />
                        <div className='grid gap-4 sm:grid-cols-3'>
                            <div className='rounded-lg border bg-card p-3'>
                                <div className='flex items-center gap-2'>
                                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                                    <span className='text-sm font-medium'>{completed} Completadas</span>
                                </div>
                            </div>
                            <div className='rounded-lg border bg-card p-3'>
                                <div className='flex items-center gap-2'>
                                    <Clock className='h-4 w-4 text-orange-500' />
                                    <span className='text-sm font-medium'>{inProgress} En Proceso</span>
                                </div>
                            </div>
                            <div className='rounded-lg border bg-card p-3'>
                                <div className='flex items-center gap-2'>
                                    <AlertCircle className='h-4 w-4 text-red-500' />
                                    <span className='text-sm font-medium'>{delayed} retrasadas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <TableProjects projectId={id} />

                </div>
                <div className='space-y-6'>
                    <div className='rounded-lg border bg-card'>
                        <div className='flex items-center gap-2 border-b p-4'>
                            <CalendarDays className='h-4 w-4 text-muted-foreground' />
                            <h2 className='text-sm font-medium'>Fechas del Proyecto</h2>
                        </div>
                        <div className='p-4'>
                            <div className='space-y-4'>
                                <div>
                                    <span className='text-sm text-muted-foreground'>Fecha de Inicio</span>
                                    <p className='font-medium'> {new Date(project.dateStart).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className='text-sm text-muted-foreground'>Fecha de Inicio</span>
                                    <p className='font-medium'> {new Date(project.dateEnd).toLocaleDateString()}</p>
                                </div>
                                <Separator />
                                <div>
                                    <span className='text-sm text-muted-foreground'>Duracion</span>
                                    <p className="font-medium">
                                        {
                                        // Calcula la diferencia en milisegundos y luego convierte a días
                                        Math.ceil((new Date(project.dateEnd) - new Date(project.dateStart)) / (1000 * 60 * 60 * 24))
                                        }{" "}
                                        días
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='rounded-lg border bg-card'>
                        <div className='border-b p-4'>
                            <h2 className='text-sm font-medium'>Calendario</h2>
                        </div>
                        <div className='p-4'>
                            <Calendar mode="single" date={new Date( project.dateStart)} className="rounded-md border "   />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

export default ProjectDetails;