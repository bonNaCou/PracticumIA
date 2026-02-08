import Select from "react-select";

const ciclos = [
  {
    value: "DAW",
    label: "Desarrollo de Aplicaciones Web (DAW)",
    curso: "1º / 2º",
    especialidad: "Desarrollo Web",
    modulos: ["HTML", "CSS", "JavaScript", "React", "PHP"],
    ai_tip: "Ideal para perfiles creativos en desarrollo frontend, backend y diseño web."
  },
  {
    value: "DAM",
    label: "Desarrollo de Aplicaciones Multiplataforma (DAM)",
    curso: "1º / 2º",
    especialidad: "Software multiplataforma",
    modulos: ["Java", "Kotlin", "SQL", "Android"],
    ai_tip: "Perfecto para apps móviles, escritorio y programación general."
  },
  {
    value: "SMR",
    label: "Sistemas Microinformáticos y Redes (SMR)",
    curso: "1º / 2º",
    especialidad: "Redes y soporte",
    modulos: ["Hardware", "Sistemas Operativos", "Redes"],
    ai_tip: "Recomendado para perfiles técnicos que disfrutan de sistemas y soporte IT."
  },
  {
    value: "ASIR",
    label: "Administración de Sistemas Informáticos en Red (ASIR)",
    curso: "1º / 2º",
    especialidad: "Ciberseguridad y servidores",
    modulos: ["Linux", "Windows Server", "Docker"],
    ai_tip: "Excelente para quienes quieren trabajar en cloud, servidores y ciberseguridad."
  },
  {
    value: "Higiene",
    label: "Higiene Bucodental",
    curso: "1º / 2º",
    especialidad: "Área bucodental",
    modulos: ["Radiología", "Educación sanitaria"],
    ai_tip: "Perfecto para perfiles asistenciales con vocación sanitaria."
  },
  {
    value: "Enfermeria",
    label: "Enfermería",
    curso: "1º / 2º",
    especialidad: "Cuidados clínicos",
    modulos: ["Anatomía", "Farmacología"],
    ai_tip: "Ideal para vocación hospitalaria y clínica."
  }
];

export default function SelectCiclo({ value, onChange }) {
  const handleSelect = (selected) => {
    onChange(selected.value, selected);
  };

  return (
    <Select
      options={ciclos}
      placeholder="Selecciona un ciclo..."
      value={ciclos.find((c) => c.value === value) || null}
      onChange={handleSelect}
      isSearchable
    />
  );
}
