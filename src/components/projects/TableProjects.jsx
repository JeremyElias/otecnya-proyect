import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload } from "lucide-react";
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

  // Cuando los datos de la tabla cambian, se actualizan en la tabla directamente
  useEffect(() => {
    if (projectData.length > 0) {
      setTableData(projectData); // Actualiza los datos de la tabla
    }
  }, [projectData]); // Este efecto solo se ejecuta cuando `projectData` cambia


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

        // Agregar el projectId a cada entrada
        const formattedData = jsonData.slice(1).map(([rut, nombre]) => ({
          rut,
          nombre,
          respuestas_acertadas: 0,
          en_proceso: 0,
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

    try {
      const response = await fetch("http://localhost:5000/api/upload-excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: tableData }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          `Error en la solicitud: ${result.message || "Error desconocido"}`
        );
      }

      const result = await response.json();
      alert(`Éxito: ${result.message}`);
      fetchProjectData(); // Recarga los datos de la tabla después de la inserción
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

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
              {projectData.map((item, index) => (
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
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </>
  );
};

export default TableProjects;
