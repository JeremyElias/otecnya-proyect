import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function ProjectsList({ projects }) {
  const navigate = useNavigate();
  const [participantsCounts, setParticipantsCounts] = useState({}); // Almacena el conteo por projectId

  useEffect(() => {
    // Función para obtener el conteo de participantes
    const fetchParticipantsCounts = async () => {
      const counts = {};
      for (const project of projects) {
        try {
          const response = await fetch(`http://localhost:5000/api/countPeople/${project.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            counts[project.id] = data[0]?.['count(rut)'] || 0; // Almacena el conteo en el objeto
          } else {
            console.error(`Error al obtener conteo para el proyecto ${project.id}`);
            counts[project.id] = 0; // Maneja errores devolviendo 0
          }
        } catch (error) {
          console.error(`Error al obtener el conteo para el proyecto ${project.id}:`, error);
          counts[project.id] = 0; // Manejo de errores
        }
      }
      setParticipantsCounts(counts); // Actualiza el estado con los conteos
    };

    if (projects?.length > 0) {
      fetchParticipantsCounts();
    }
  }, [projects]);

  if(!projects || projects.length === 0) {
    return <p>No hay proyectos disponibles.</p>
  }
  return (
    <div className="container mx-auto px-8 py-6">
      {/* Verificación si 'projects' es un arreglo y si tiene elementos */}
      {Array.isArray(projects) && projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-5">
          {projects.map((project) => (
            <li className="flex flex-col border rounded-lg" key={project.id}>
              <img 
                src={`http://localhost:5000${project.img}`}  
                alt={project.name} 
                className="h-48 object-cover w-full rounded-t-lg" 
              />
              <div className="item-center gap-2 ps-3 pt-2">
                <h2 className="text-xl font-semibold p-1">{project.name}</h2>
              </div>
              <div className="flex-1 p-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div className="ps-3">
                <p className="p-1 text-xs text-muted-foreground rounded bg-slate-200 inline-block">{participantsCounts[project.id] !== undefined ? `${participantsCounts[project.id]} / ${project.totalParticipants} - participantes `: 'Cargando...'}</p>
              </div>
              <div>
                <p className="p-2 text-sm text-muted-foreground">{new Date(project.dateStart).toLocaleDateString()} - {new Date(project.dateEnd).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end p-2">
                <a key={project.id} onClick={() =>navigate(`/projects/${project.id}`, { state: { project } })} className="flex text-black p-2 rounded-md border hover:bg-gray-200 w-full justify-center items-center font-semibold mt-auto">
                  Ver proyecto
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground mt-5">No se encontraron proyectos.</p>
      )}
    </div>
  );
}


export default ProjectsList;
