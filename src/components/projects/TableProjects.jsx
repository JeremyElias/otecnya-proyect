import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AlertTriangle, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const TableProjects = ({ projectId }) => {
  const [tableData, setTableData] = useState([]); // Almacena los datos procesados
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga
  const [error, setError] = useState(null); // Para manejar errores
  const [projectData, setProjectData] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(5); // Participantes por página

  const fetchTotalQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/totalQuestions/${projectId}`);
      if (!response.ok) {
        throw new Error("Error al cargar el valor de totalQuestions.");
      }
      const data = await response.json();
      setTotalQuestions(data.totalQuestions); // Asignamos el valor de totalQuestions
    } catch (error) {
      console.error("Error al obtener el totalQuestions:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async () => {
    setLoading(true); // Empezamos a cargar los datos
    try {
      const response = await fetch(
        `http://localhost:5000/api/projectsPeopleData/${projectId}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setProjectData(data); // Actualiza los datos de la tabla
    } catch (error) {
      console.error("Error al cargar los datos del proyecto:", error.message);
      setError(error.message);
    } finally {
      setLoading(false); // Termina la carga
    }
  };

  // Este efecto se ejecutará cada vez que cambie el `projectId`, cargando los datos correspondientes
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]); // Dependiendo de projectId, vuelve a cargar los datos

  // Función para manejar el archivo subido
  const handlerFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Verificar que totalQuestions no sea null
        if (totalQuestions === null) {
          console.error("totalQuestions aún no se ha cargado.");
          return;
        }

        // Agregar el projectId y en_proceso a cada entrada
        const formattedData = jsonData.slice(1).map(([rut, nombre]) => ({
          rut,
          nombre,
          respuestas_acertadas: 0,
          en_proceso: totalQuestions, // Asignamos totalQuestions a en_proceso
          respuestas_erroneas: 0,
          projectId: projectId || null,
        }));

        setTableData(formattedData); // Almacenar los datos procesados
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const uploadData = async () => {
    if (!projectId) {
      alert("El ID del proyecto es necesario.");
      return;
    }
  
    if (tableData.length === 0) {
      alert("No hay datos para cargar.");
      return;
    }
  
    const payload = {
      data: tableData,
      projectId: projectId,
      totalQuestions: totalQuestions,  // Asegúrate de enviar totalQuestions
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/upload-excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Error en la solicitud: ${result.error || "Error desconocido"}`);
      }
  
      const result = await response.json();
      alert(`Éxito: ${result.message}`);
      fetchProjectData(); // Recarga los datos de la tabla después de la inserción
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      alert("Hubo un error al subir los datos. Intente nuevamente.");
    }
  };

  // Llamar a fetchTotalQuestions cuando el componente se monte
  useEffect(() => {
    if (projectId) {
      fetchTotalQuestions();
    }
  }, [projectId]);

  
  // Lógica para obtener los participantes a mostrar en la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = projectData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(projectData.length / itemsPerPage);

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <h2 className="text-sm font-medium">Subir Información</h2>
        <div className="flex items-center gap-3">
          <Input
            type="file"
            className="flex-1 border-dashed text-sm file:text-sm"
            accept=".xlsx, .xls"
            placeholder="Subir Excel"
            onChange={handlerFileUpload}
          />
          <Button size="sm" className="h-9 gap-2" onClick={uploadData}>
            <Upload className="h-4 w-4" />
            <span>Subir Excel</span>
          </Button>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Importante</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• La información a subir es solamente Rut y nombre</li>
                    <li>• El formato de la planilla debe ser .xlsx</li>
                    <li>• Favor de verificar el total de participantes en la planilla que sea igual a la cantidad de participantes en el proyecto</li>
                </ul>
              </div>
          </div>
        </div>
      </div>

      <Separator />
      <div className="space-y-4">
        <h2 className="text-sm font-medium">Información del Proyecto</h2>
        {loading && <p>Cargando datos...</p>} 
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rut</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Respuestas Acertadas</TableHead>
                <TableHead>En Proceso</TableHead>
                <TableHead>Respuestas Erroneas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.rut}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.respuestas_acertadas}</TableCell>
                  <TableCell>{item.en_proceso}</TableCell>
                  <TableCell>{item.respuestas_erroneas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {indexOfFirstItem + 1}-{indexOfLastItem} de {projectData.length} participantes
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Siguiente página</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </>
  );
};

export default TableProjects;
