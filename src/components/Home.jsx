import { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from '../context/AuthProvider';
import ProjectsList from "./ProjectsList";
import Plus from "./icons/Plus";
import Nabvar from "./Nabvar";

function Home() {
  const { auth } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalParticipants, setTotalParticipants] = useState('');
  const [total_questions, setTotalQuestions] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [imgFile, setImgFile] = useState(null);

  // Toggle del modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Cargar proyectos al cargar la página
  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth?.accessToken) {
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error al obtener proyectos: ${errorData.message}`);
          return;
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    };

    if (auth?.accessToken) {
      fetchProjects();
    }
  }, [auth]); // Dependencia solo de auth para recargar cuando cambia

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("totalParticipants", totalParticipants);
    formData.append("total_questions", total_questions);
    formData.append("dateStart", dateStart);
    formData.append("dateEnd", dateEnd);
    formData.append("img", imgFile);
  
    console.log("Enviando datos:", { name, description, totalParticipants, total_questions, dateStart, dateEnd, imgFile });
  
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al crear el proyecto:", errorData);
      } else {
        const newProject = await response.json();
        console.log("Proyecto creado:", newProject);
        setProjects((prevProjects) => [...prevProjects, newProject]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  if (!auth?.accessToken) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
    <Nabvar />
    <main className="flex-1 p-6">
      <div className="flex items-center justify-center">
        <button
          onClick={toggleModal}
          className="flex bg-black text-white p-3 rounded-md hover:bg-slate-800 items-center"
        >
          <span className="mr-2 h-4 w-4 items-center"><Plus  /></span>Nuevo Proyecto
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-700/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-w-2xl transform transition-all">
            <h3 className="text-lg font-semibold mb-4">Crea un nuevo proyecto</h3>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Nombre del Proyecto */}
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">Nombre del proyecto</label>
                <input 
                  type="text" 
                  id="project-name" 
                  name="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                  className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                  />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea 
                  id="project-description" 
                  name="description" 
                  rows="3" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                  className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                  ></textarea>
              </div>

              {/* Participantes */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label htmlFor="project-total-participants" className="block text-sm font-medium text-gray-700">Total de participantes</label>
                  <input 
                    type="number" 
                    id="project-total-participants" 
                    name="totalParticipants" 
                    value={totalParticipants}
                    onChange={(e) => setTotalParticipants(e.target.value)}
                    required 
                    className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                  />
                </div>
                <div className="w-1/2">
                    <label htmlFor="total_questions" className="block text-sm font-medium text-gray-700">Total de preguntas</label>
                    <input 
                      type="number" 
                      id="total_questions" 
                      name="total_questions" 
                      value={total_questions}
                      onChange={(e) => setTotalQuestions(e.target.value)}
                      required 
                      className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                    />
                  </div>
              </div>

              {/* Fechas */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label htmlFor="project-date-start" className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
                  <input 
                    type="date" 
                    id="project-date-start" 
                    name="dateStart" 
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    required 
                    className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                    />
                </div>
                <div className="w-1/2">
                  <label htmlFor="project-date-end" className="block text-sm font-medium text-gray-700">Fecha de fin</label>
                  <input 
                    type="date" 
                    id="project-date-end" 
                    name="dateEnd" 
                    value={dateEnd} 
                    onChange={(e) => setDateEnd(e.target.value)}
                    required 
                    className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                    />
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label htmlFor="project-img" className="block text-sm font-medium text-gray-700">Subir imagen</label>
                <input 
                  type="file" 
                  id="project-img" 
                  name="img" 
                  accept="image/*" 
                  onChange={(e) => setImgFile(e.target.files[0])}
                  required 
                  className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-black focus:ring-black sm:text-sm" 
                  />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                    type="submit"
                    className="bg-gray-950 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    disabled={isSubmitting} // Agregar el estado isSubmitting para deshabilitar el botón
                    >
                Crear
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProjectsList projects={projects} setProjects={setProjects} />
    </main>
  </div>
  );
}

export default Home;
