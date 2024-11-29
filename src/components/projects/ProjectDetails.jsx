import { useLocation, useParams } from 'react-router-dom';
import Nabvar from "../Nabvar";
import { Separator } from "../ui/separator";
import { Badge} from "../ui/badge";
import { Progress} from "../ui/progress";
import { Input } from "../ui/input";
import { Calendar } from '../ui/calendar';
import { Button } from "../ui/button";
import { CalendarDays, Upload, Clock, CheckCircle2, AlertCircle } from 'lucide-react';




function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const project = location.state?.project;

  if (!project) {
    return <p>No hay datos del proyecto. Debes recargar desde la API.</p>;
  }

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
                        <div className='relative aspect-square w-32 overflow-hidden rounded-lg border bg-muted/10'>
                            <img src={`http://localhost:5000${project.img}`} alt={project.name} width={128} height={128} className='object-cover' />
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
                                    <span className='text-sm font-medium'>12 Completadas</span>
                                </div>
                            </div>
                            <div className='rounded-lg border bg-card p-3'>
                                <div className='flex items-center gap-2'>
                                    <Clock className='h-4 w-4 text-orange-500' />
                                    <span className='text-sm font-medium'>8 En Proceso</span>
                                </div>
                            </div>
                            <div className='rounded-lg border bg-card p-3'>
                                <div className='flex items-center gap-2'>
                                    <AlertCircle className='h-4 w-4 text-red-500' />
                                    <span className='text-sm font-medium'>3 retrasadas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className='space-y-4'>
                        <h2 className='text-sm font-medium'>Subir Información</h2>
                        <div className='flex items-center gap-3'>
                            <Input type="file" className="flex-1 border-dashed text-sm file:text-sm" accept=".xlsx, .xls" placeholder="Subir Excel" />
                            <Button size="sm" className="h-9 gap-2">
                                <Upload className="h-4 w-4" />
                                <span>Subir Excel</span>
                            </Button>
                        </div>
                    </div>
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
                            <Calendar mode="single" date={new Date( project.dateStart)} className="rounded-md border" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

export default ProjectDetails;