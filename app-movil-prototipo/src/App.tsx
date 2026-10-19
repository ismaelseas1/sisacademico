import { useMemo, useState } from "react";
import {
  carrera,
  docente,
  docentes,
  estados,
  estudiantes,
  facultad,
  iniciales,
  inscripciones as inscripcionesIniciales,
  institucion,
  materiasDisponibles,
  primerNombre,
  proyectos as proyectosIniciales,
  yo,
  type EstadoNombre,
  type Inscripcion,
  type Materia,
  type Proyecto,
} from "./data";

type IconName =
  | "home" | "book" | "folder" | "user" | "users" | "arrow" | "calendar" | "check" | "chevron"
  | "close" | "edit" | "eye" | "graduation" | "lock" | "logout" | "mail" | "plus" | "search"
  | "star" | "trash" | "monitor" | "info" | "alert";

type Screen =
  | "COM_Splash"
  | "COM_Login"
  | "COM_SoloWeb"
  | "EST_Inicio"
  | "EST_MisMaterias"
  | "EST_Inscripcion"
  | "EST_MisProyectos"
  | "EST_DetalleProyecto"
  | "EST_FormProyecto"
  | "EST_AgregarMiembro"
  | "EST_Perfil"
  | "DOC_Inicio"
  | "DOC_Proyectos"
  | "DOC_DetalleProyecto"
  | "DOC_Estudiantes"
  | "DOC_FichaEstudiante"
  | "DOC_Perfil";

// Endpoints de /api/v1 que consume cada pantalla.
const endpoints: Record<Screen, string[]> = {
  COM_Splash: ["Lee el token guardado → GET /me"],
  COM_Login: ["POST /login"],
  COM_SoloWeb: ["Rol admin: la app cierra la sesión (POST /logout)"],
  EST_Inicio: ["GET /me", "GET /proyectos?miembro_id="],
  EST_MisMaterias: ["GET /inscripciones?estudiante_id=", "DELETE /inscripciones/{id}"],
  EST_Inscripcion: ["GET /materias?carrera_id=&semestre_materia=", "POST /inscripciones"],
  EST_MisProyectos: ["GET /proyectos?miembro_id="],
  EST_DetalleProyecto: ["GET /proyectos/{id}", "DELETE /proyectos/{id}/miembros/{m}"],
  EST_FormProyecto: ["GET /docentes", "POST /proyectos · PUT /proyectos/{id}"],
  EST_AgregarMiembro: ["GET /estudiantes?buscar=", "POST /proyectos/{id}/miembros"],
  EST_Perfil: ["GET /me", "POST /logout"],
  DOC_Inicio: ["GET /me", "GET /proyectos?tutor_id="],
  DOC_Proyectos: ["GET /proyectos?tutor_id=&estado_id=", "GET /estados-proyecto"],
  DOC_DetalleProyecto: ["GET /proyectos/{id}", "PUT /proyectos/{id} {estado_id}"],
  DOC_Estudiantes: ["GET /estudiantes?buscar=&semestre="],
  DOC_FichaEstudiante: ["GET /estudiantes/{id} (incluye materias)", "GET /proyectos?miembro_id="],
  DOC_Perfil: ["GET /me", "POST /logout"],
};

const frames = Object.keys(endpoints) as Screen[];

// Respeta la base pública (en Figma Make la app no se sirve desde la raíz).
const logoBlanco = `${import.meta.env.BASE_URL}logo-uno-blanco.png`;
const logoColor = `${import.meta.env.BASE_URL}logo-uno-transparente.png`;

const iconPaths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6" /></>,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 6h8M8 10h7" /></>,
  folder: <><path d="M3 6.5h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 10h18" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5a3.5 3.5 0 0 1 0 7M17 14a6 6 0 0 1 4.5 6" /></>,
  arrow: <path d="m15 18-6-6 6-6" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  edit: <path d="m4 20 4.2-1 11-11a2 2 0 0 0-3-3l-11 11zM14.5 6.5l3 3" />,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12" /><circle cx="12" cy="12" r="2.5" /></>,
  graduation: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5M22 9v6" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  logout: <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M15 8l4 4-4 4M19 12H8" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></>,
};

function Icon({ name, size = 20, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

function Button({ children, onClick, variant = "primary", icon, type = "button", disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "text" | "danger"; icon?: IconName; type?: "button" | "submit"; disabled?: boolean }) {
  return <button type={type} className={`button button--${variant}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={18} />}{children}</button>;
}

function IconButton({ icon, label, onClick }: { icon: IconName; label: string; onClick?: () => void }) {
  return <button type="button" className="icon-button" onClick={onClick} aria-label={label}><Icon name={icon} /></button>;
}

function Field({ label, placeholder, icon, type = "text", value, onChange, defaultValue }: { label: string; placeholder: string; icon?: IconName; type?: string; value?: string; onChange?: (v: string) => void; defaultValue?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-control">
        {icon && <Icon name={icon} size={18} />}
        <input type={type} placeholder={placeholder} value={value} defaultValue={defaultValue} onChange={onChange ? (e) => onChange(e.target.value) : undefined} />
        {type === "password" && <Icon name="eye" size={18} />}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value?: string; onChange?: (v: string) => void; children?: React.ReactNode }) {
  return <label className="field"><span>{label}</span><div className="field-control"><select value={value} onChange={(e) => onChange?.(e.target.value)}>{children}</select><Icon name="chevron" size={18} /></div></label>;
}

function TextArea({ label, placeholder, defaultValue }: { label: string; placeholder: string; defaultValue?: string }) {
  return <label className="field"><span>{label}</span><textarea placeholder={placeholder} rows={3} defaultValue={defaultValue} /></label>;
}

function TopBar({ title, back, action }: { title: string; back?: () => void; action?: React.ReactNode }) {
  return <header className="topbar">{back ? <IconButton icon="arrow" label="Volver" onClick={back} /> : <img className="topbar-logo" src={logoColor} alt="UNO" />}<div className="topbar-title">{title}</div><div className="topbar-action">{action}</div></header>;
}

function Avatar({ name, tone = "blue", small = false }: { name: string; tone?: "blue" | "green" | "gold" | "gray"; small?: boolean }) {
  return <div className={`avatar avatar--${tone} ${small ? "avatar--small" : ""}`}>{iniciales(name)}</div>;
}

function StatusChip({ status }: { status: EstadoNombre }) {
  const key = status === "En progreso" ? "progress" : status === "Finalizado" ? "done" : "pending";
  return <span className={`chip chip--${key}`}><span className="chip-dot" />{status}</span>;
}

function Note({ icon = "info", children }: { icon?: IconName; children: React.ReactNode }) {
  return <div className="info-banner"><Icon name={icon} size={18} /><span>{children}</span></div>;
}

function BottomNav({ active, role, go }: { active: string; role: "student" | "teacher"; go: (screen: Screen) => void }) {
  const items: [string, IconName, Screen][] = role === "student"
    ? [["Inicio", "home", "EST_Inicio"], ["Materias", "book", "EST_MisMaterias"], ["Proyectos", "folder", "EST_MisProyectos"], ["Perfil", "user", "EST_Perfil"]]
    : [["Inicio", "home", "DOC_Inicio"], ["Proyectos", "folder", "DOC_Proyectos"], ["Estudiantes", "users", "DOC_Estudiantes"], ["Perfil", "user", "DOC_Perfil"]];
  return (
    <nav className="bottom-nav">
      {items.map(([label, icon, screen]) => (
        <button className={active === label ? "nav-item nav-item--active" : "nav-item"} key={label} onClick={() => go(screen)} aria-current={active === label ? "page" : undefined}>
          <span className="nav-icon"><Icon name={icon} size={21} /></span><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function AppScreen({ children, nav, className = "" }: { children: React.ReactNode; nav?: React.ReactNode; className?: string }) {
  return <div className={`app-screen ${className}`}><main className="screen-content">{children}</main>{nav}</div>;
}

function ProjectCard({ p, subtitle, onClick }: { p: Proyecto; subtitle: string; onClick?: () => void }) {
  return (
    <button type="button" className="card project-card" onClick={onClick}>
      <div className="card-row"><div className="project-icon"><Icon name="folder" /></div><StatusChip status={p.estado} /></div>
      <div className="card-title">{p.titulo}</div>
      <div className="meta-line"><Icon name="user" size={15} />{subtitle}</div>
      <div className="card-divider" />
      <div className="date-line"><Icon name="calendar" size={15} />{p.fecha_inicio} — {p.fecha_fin}<Icon name="chevron" size={17} /></div>
    </button>
  );
}

type DialogState = { title: string; body: string; confirm: string; tone?: "primary" | "danger"; onConfirm?: () => void; toast?: string };

function ConfirmDialog({ d, onClose }: { d: DialogState; onClose: (confirmed: boolean) => void }) {
  const danger = d.tone === "danger";
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <div className="dialog">
        <div className={`dialog-icon ${danger ? "dialog-icon--danger" : ""}`}><Icon name={danger ? "alert" : "check"} size={24} /></div>
        <div className="dialog-title" id="dlg-title">{d.title}</div>
        <p>{d.body}</p>
        <div className="dialog-actions"><Button variant="text" onClick={() => onClose(false)}>Cancelar</Button><Button variant={danger ? "danger" : "primary"} onClick={() => onClose(true)}>{d.confirm}</Button></div>
      </div>
    </div>
  );
}

export default function App() {
  // ?pantalla=EST_Inicio abre directamente esa pantalla (útil para revisar o capturar).
  const [screen, setScreen] = useState<Screen>(() => {
    const inicial = new URLSearchParams(window.location.search).get("pantalla");
    return frames.includes(inicial as Screen) ? (inicial as Screen) : "COM_Splash";
  });
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>(inscripcionesIniciales);
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosIniciales);
  const [proyectoId, setProyectoId] = useState(1);
  const [estudianteId, setEstudianteId] = useState(1);
  const [editando, setEditando] = useState(false);
  const [tabProyectos, setTabProyectos] = useState<"activos" | "finalizados">("activos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [semestre, setSemestre] = useState("5");
  const [buscar, setBuscar] = useState("");
  const [tabFicha, setTabFicha] = useState<"materias" | "proyectos">("materias");
  const [nuevoEstado, setNuevoEstado] = useState<EstadoNombre>("En progreso");

  const proyecto = proyectos.find((p) => p.id === proyectoId) ?? proyectos[0];
  const misProyectos = proyectos.filter((p) => p.miembros.some((m) => m.estudiante.id === yo.id));
  const creditos = inscripciones.reduce((s, i) => s + i.materia.creditos, 0);
  const estudiante = estudiantes.find((e) => e.id === estudianteId) ?? estudiantes[0];

  const go = (next: Screen) => {
    setScreen(next);
    setDialog(null);
  };

  const confirmar = (d: DialogState) => setDialog(d);
  const cerrarDialogo = (ok: boolean) => {
    if (ok && dialog) {
      dialog.onConfirm?.();
      if (dialog.toast) {
        setToast(dialog.toast);
        window.setTimeout(() => setToast(null), 2200);
      }
    }
    setDialog(null);
  };

  const ingresar = (u: string, pass: string) => {
    const id = u.trim().toLowerCase();
    if (!id || !pass) return setLoginError(true);
    setLoginError(false);
    if (id.startsWith("admin")) return go("COM_SoloWeb");
    if (id === docente.username) return go("DOC_Inicio");
    go("EST_Inicio");
  };

  const abrirProyecto = (id: number, destino: Screen) => {
    setProyectoId(id);
    setNuevoEstado(proyectos.find((p) => p.id === id)?.estado ?? "Pendiente");
    go(destino);
  };

  const cerrarSesion = () => confirmar({ title: "¿Cerrar sesión?", body: "Tendrás que volver a ingresar con tu usuario institucional.", confirm: "Cerrar sesión", tone: "danger", onConfirm: () => { setUsuario(""); setPassword(""); setScreen("COM_Login"); } });

  const studentNav = (active: string) => <BottomNav role="student" active={active} go={go} />;
  const teacherNav = (active: string) => <BottomNav role="teacher" active={active} go={go} />;

  const estudiantesFiltrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return estudiantes.filter((e) => !q || e.nombre.toLowerCase().includes(q) || e.registro.includes(q));
  }, [buscar]);

  const renderScreen = () => {
    switch (screen) {
      case "COM_Splash":
        return (
          <AppScreen className="splash-screen">
            <div className="splash-decoration splash-decoration--one" />
            <div className="splash-decoration splash-decoration--two" />
            <div className="brand-lockup">
              <img className="splash-logo" src={logoBlanco} alt="Universidad Nacional del Oriente" />
              <div className="brand-subtitle">App Académica</div>
            </div>
            <div className="splash-footer"><div className="loader"><span /><span /><span /></div><button onClick={() => go("COM_Login")}>Continuar</button></div>
          </AppScreen>
        );

      case "COM_Login":
        return (
          <AppScreen className="auth-screen">
            <div className="auth-hero">
              <img className="auth-logo" src={logoBlanco} alt="Universidad Nacional del Oriente" />
              <div className="eyebrow">APP ACADÉMICA · ESTUDIANTES Y DOCENTES</div>
              <div className="auth-title">Bienvenido</div>
              <p>Ingresa con tu usuario o correo institucional.</p>
            </div>
            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); ingresar(usuario, password); }}>
              <Field label="Usuario o correo" placeholder="Ej. jperez o jperez@uno.edu.bo" icon="user" value={usuario} onChange={setUsuario} />
              <Field label="Contraseña" placeholder="Tu contraseña" icon="lock" type="password" value={password} onChange={setPassword} />
              {loginError && <div className="form-error" role="alert"><Icon name="alert" size={16} />Las credenciales no coinciden con nuestros registros.</div>}
              <Button type="submit">Ingresar <Icon name="chevron" size={18} /></Button>
              <div className="secure-note"><Icon name="info" size={14} />¿Olvidaste tu contraseña? Solicita el cambio en Dirección Académica.</div>
              <div className="demo-logins">
                <span>Probar como:</span>
                <button type="button" onClick={() => ingresar("jperez", "x")}>Estudiante</button>
                <button type="button" onClick={() => ingresar("mlopez", "x")}>Docente</button>
                <button type="button" onClick={() => ingresar("admin", "x")}>Admin</button>
              </div>
            </form>
          </AppScreen>
        );

      case "COM_SoloWeb":
        return (
          <AppScreen className="soloweb-screen">
            <div className="soloweb">
              <img className="soloweb-logo" src={logoColor} alt="Universidad Nacional del Oriente" />
              <div className="empty-illustration"><Icon name="monitor" size={40} /><span><Icon name="lock" size={16} /></span></div>
              <div className="page-title">Esta cuenta es administrativa</div>
              <p>La app es solo para estudiantes y docentes. La gestión de usuarios, roles, facultades, carreras y materias se hace desde el <strong>sistema web</strong>.</p>
              <div className="soloweb-url"><Icon name="monitor" size={18} />sisacademico.uno.edu.bo</div>
              <Button onClick={() => go("COM_Login")} icon="logout">Volver al inicio de sesión</Button>
            </div>
          </AppScreen>
        );

      case "EST_Inicio":
        return (
          <AppScreen nav={studentNav("Inicio")}>
            <div className="home-header">
              <div><span>Buenos días,</span><div className="page-title">{primerNombre(yo.nombre)}</div></div>
              <img className="home-logo" src={logoColor} alt="UNO" />
            </div>
            <div className="identity-card">
              <div className="identity-top"><Avatar name={yo.nombre} /><div><strong>{yo.nombre}</strong><span>{carrera}</span></div><span className="verified" aria-label="Cuenta activa"><Icon name="check" size={13} /></span></div>
              <div className="stats-row">
                <div><span>Registro</span><strong>{yo.registro}</strong></div><div><span>Semestre</span><strong>{yo.semestre}.º</strong></div><div><span>PPA</span><strong className="green-text">{yo.ppa.toFixed(2)}</strong></div>
              </div>
            </div>
            <SectionTitle title="Accesos rápidos" />
            <div className="quick-grid">
              <QuickAction icon="book" label="Mis materias" tone="blue" onClick={() => go("EST_MisMaterias")} />
              <QuickAction icon="folder" label="Mis proyectos" tone="gray" onClick={() => go("EST_MisProyectos")} />
              <QuickAction icon="plus" label="Inscribirme" tone="green" onClick={() => go("EST_Inscripcion")} />
            </div>
            <div className="mini-stats">
              <div><strong>{inscripciones.length}</strong><span>materias inscritas</span></div>
              <div><strong>{creditos}</strong><span>créditos</span></div>
              <div><strong>{misProyectos.filter((p) => p.estado !== "Finalizado").length}</strong><span>proyectos activos</span></div>
            </div>
            <SectionTitle title="Proyectos en curso" action="Ver todos" onAction={() => go("EST_MisProyectos")} />
            <div className="list-stack">
              {misProyectos.filter((p) => p.estado !== "Finalizado").map((p) => (
                <button key={p.id} className="card next-card" onClick={() => abrirProyecto(p.id, "EST_DetalleProyecto")}>
                  <div className="project-icon"><Icon name="folder" /></div>
                  <div><span className="small-label">{p.miembros.find((m) => m.estudiante.id === yo.id)?.rol.toUpperCase()}</span><strong>{p.titulo}</strong><span>Tutor: {p.tutor}</span></div>
                  <StatusChip status={p.estado} />
                </button>
              ))}
            </div>
          </AppScreen>
        );

      case "EST_MisMaterias":
        return (
          <AppScreen nav={studentNav("Materias")}>
            <TopBar title="Mis materias" action={<IconButton icon="plus" label="Inscribir materia" onClick={() => go("EST_Inscripcion")} />} />
            <div className="summary-strip"><div><span>Semestre actual</span><strong>{yo.semestre}.º semestre · {carrera}</strong></div><div className="credit-badge"><strong>{creditos}</strong><span>créditos</span></div></div>
            {inscripciones.length === 0 ? (
              <EmptyState icon="book" title="Aún no tienes materias inscritas" text="Inscríbete en las materias de tu semestre." action="Inscribir materia" onClick={() => go("EST_Inscripcion")} />
            ) : (
              <div className="list-stack">
                {inscripciones.map((i, n) => (
                  <SubjectCard key={i.id} materia={i.materia} date={i.fecha_inscripcion} tone={(["blue", "green", "gold", "gray"] as const)[n % 4]}
                    onDrop={() => confirmar({ title: "¿Dar de baja la materia?", body: `Se eliminará tu inscripción en ${i.materia.nombre} (${i.materia.codigo}).`, confirm: "Dar de baja", tone: "danger", toast: "Inscripción eliminada", onConfirm: () => setInscripciones((xs) => xs.filter((x) => x.id !== i.id)) })} />
                ))}
              </div>
            )}
          </AppScreen>
        );

      case "EST_Inscripcion": {
        const inscritas = new Set(inscripciones.map((i) => i.materia.id));
        const lista = materiasDisponibles.filter((m) => String(m.semestre_materia) === semestre);
        return (
          <AppScreen>
            <TopBar title="Inscribir materia" back={() => go("EST_MisMaterias")} />
            <div className="filter-row">
              <SelectField label="Semestre de la materia" value={semestre} onChange={setSemestre}>
                {[3, 4, 5, 6, 7].map((s) => <option key={s} value={s}>{s}.º semestre</option>)}
              </SelectField>
              <div className="available"><strong>{lista.filter((m) => !inscritas.has(m.id)).length}</strong><span>disponibles</span></div>
            </div>
            <Note icon="book">Materias de <strong>{carrera}</strong>. No puedes inscribirte dos veces en la misma materia.</Note>
            {lista.length === 0 ? (
              <EmptyState icon="book" title="Sin materias para este semestre" text="Prueba con otro semestre o consulta a Dirección Académica." />
            ) : (
              <div className="list-stack">
                {lista.map((m) => (
                  <EnrollCard key={m.id} materia={m} inscrita={inscritas.has(m.id)}
                    onClick={() => confirmar({ title: "¿Inscribirte en esta materia?", body: `${m.nombre} · ${m.codigo} · ${m.creditos} créditos. Puedes darla de baja después desde Mis materias.`, confirm: "Inscribirme", toast: "Inscripción registrada", onConfirm: () => setInscripciones((xs) => [...xs, { id: Date.now(), materia: m, fecha_inscripcion: "Hoy" }]) })} />
                ))}
              </div>
            )}
          </AppScreen>
        );
      }

      case "EST_MisProyectos": {
        const activos = misProyectos.filter((p) => p.estado !== "Finalizado");
        const finalizados = misProyectos.filter((p) => p.estado === "Finalizado");
        const lista = tabProyectos === "activos" ? activos : finalizados;
        return (
          <AppScreen nav={studentNav("Proyectos")}>
            <TopBar title="Mis proyectos" action={<IconButton icon="plus" label="Nuevo proyecto" onClick={() => { setEditando(false); go("EST_FormProyecto"); }} />} />
            <div className="segmented" role="tablist">
              <button role="tab" aria-selected={tabProyectos === "activos"} className={tabProyectos === "activos" ? "active" : ""} onClick={() => setTabProyectos("activos")}>Activos <span>{activos.length}</span></button>
              <button role="tab" aria-selected={tabProyectos === "finalizados"} className={tabProyectos === "finalizados" ? "active" : ""} onClick={() => setTabProyectos("finalizados")}>Finalizados <span>{finalizados.length}</span></button>
            </div>
            {lista.length === 0 ? (
              <EmptyState icon="folder" title={tabProyectos === "activos" ? "Aún no tienes proyectos" : "Sin proyectos finalizados"} text="Crea uno nuevo y empieza a colaborar con tu equipo." action="Crear proyecto" onClick={() => { setEditando(false); go("EST_FormProyecto"); }} />
            ) : (
              <div className="list-stack">
                {lista.map((p) => <ProjectCard key={p.id} p={p} subtitle={`Tutor: ${p.tutor}`} onClick={() => abrirProyecto(p.id, "EST_DetalleProyecto")} />)}
              </div>
            )}
            <button className="fab" onClick={() => { setEditando(false); go("EST_FormProyecto"); }}><Icon name="plus" /> Nuevo</button>
          </AppScreen>
        );
      }

      case "EST_DetalleProyecto":
      case "DOC_DetalleProyecto": {
        const isTeacher = screen === "DOC_DetalleProyecto";
        const soyLider = proyecto.miembros.some((m) => m.estudiante.id === yo.id && m.es_lider);
        return (
          <AppScreen>
            <TopBar title="Detalle del proyecto" back={() => go(isTeacher ? "DOC_Proyectos" : "EST_MisProyectos")}
              action={!isTeacher && soyLider ? <IconButton icon="edit" label="Editar proyecto" onClick={() => { setEditando(true); go("EST_FormProyecto"); }} /> : undefined} />
            <div className="project-detail-hero"><StatusChip status={proyecto.estado} /><div className="page-title">{proyecto.titulo}</div><p>{proyecto.descripcion}</p></div>
            <div className="detail-grid">
              <DetailItem icon="user" label={isTeacher ? "Autor" : "Tutor"} value={isTeacher ? proyecto.autor : proyecto.tutor} />
              <DetailItem icon="calendar" label="Duración" value={`${proyecto.fecha_inicio} — ${proyecto.fecha_fin}`} />
            </div>
            {isTeacher && (
              <div className="status-editor">
                <SelectField label="Estado del proyecto" value={nuevoEstado} onChange={(v) => setNuevoEstado(v as EstadoNombre)}>
                  {estados.map((e) => <option key={e}>{e}</option>)}
                </SelectField>
                <Button disabled={nuevoEstado === proyecto.estado} onClick={() => confirmar({ title: "¿Cambiar el estado?", body: `El proyecto pasará de "${proyecto.estado}" a "${nuevoEstado}". Los estudiantes verán el cambio.`, confirm: "Guardar", toast: "Estado actualizado", onConfirm: () => setProyectos((ps) => ps.map((p) => p.id === proyecto.id ? { ...p, estado: nuevoEstado, actualizado: "Ahora" } : p)) })}>Guardar</Button>
              </div>
            )}
            <SectionTitle title="Miembros del equipo" action={`${proyecto.miembros.length} integrantes`} />
            <div className="card member-list">
              {proyecto.miembros.map((m, n) => (
                <Member key={m.id} name={m.estudiante.nombre} role={`${m.es_lider ? "Líder · " : ""}${m.rol}`} leader={m.es_lider} tone={(["blue", "green", "gold"] as const)[n % 3]}
                  onRemove={!isTeacher && soyLider && !m.es_lider ? () => confirmar({ title: "¿Quitar del equipo?", body: `${m.estudiante.nombre} dejará de ser miembro de este proyecto.`, confirm: "Quitar", tone: "danger", toast: "Miembro quitado", onConfirm: () => setProyectos((ps) => ps.map((p) => p.id === proyecto.id ? { ...p, miembros: p.miembros.filter((x) => x.id !== m.id) } : p)) }) : undefined} />
              ))}
            </div>
            {!isTeacher && soyLider && <Button variant="secondary" icon="plus" onClick={() => go("EST_AgregarMiembro")}>Agregar miembro</Button>}
            {!isTeacher && !soyLider && <Note>Solo el líder del equipo puede editar el proyecto y sus miembros.</Note>}
          </AppScreen>
        );
      }

      case "EST_FormProyecto": {
        const p = editando ? proyecto : null;
        return (
          <AppScreen>
            <TopBar title={p ? "Editar proyecto" : "Nuevo proyecto"} back={() => go(p ? "EST_DetalleProyecto" : "EST_MisProyectos")} />
            <div className="form-stack">
              <Field label="Título del proyecto *" placeholder="Ej. Sistema de reservas de laboratorios" defaultValue={p?.titulo} />
              <TextArea label="Descripción" placeholder="Describe el objetivo del proyecto..." defaultValue={p?.descripcion} />
              <SelectField label="Docente tutor" value={p?.tutor ?? docentes[0]}>{docentes.map((d) => <option key={d}>{d}</option>)}</SelectField>
              <div className="field-pair"><Field label="Fecha de inicio" placeholder="03/03/2026" icon="calendar" defaultValue={p ? "03/03/2026" : undefined} /><Field label="Fecha de fin" placeholder="28/11/2026" icon="calendar" defaultValue={p ? "28/11/2026" : undefined} /></div>
              {p ? (
                <Note>El estado del proyecto lo cambia el docente tutor.</Note>
              ) : (
                <Note icon="star">Quedarás registrado como <strong>Autor y líder</strong> del equipo. El proyecto inicia en estado <strong>Pendiente</strong>; luego podrás agregar a tus compañeros.</Note>
              )}
              <Button onClick={() => confirmar({ title: p ? "¿Guardar cambios?" : "¿Crear el proyecto?", body: p ? "Se actualizarán los datos del proyecto." : "Se creará el proyecto y quedarás como líder del equipo.", confirm: p ? "Guardar" : "Crear proyecto", toast: p ? "Proyecto actualizado" : "Proyecto creado", onConfirm: () => go(p ? "EST_DetalleProyecto" : "EST_MisProyectos") })}>{p ? "Guardar cambios" : "Crear proyecto"}</Button>
            </div>
          </AppScreen>
        );
      }

      case "EST_AgregarMiembro": {
        const yaMiembros = new Set(proyecto.miembros.map((m) => m.estudiante.id));
        return (
          <AppScreen>
            <TopBar title="Agregar miembro" back={() => go("EST_DetalleProyecto")} />
            <div className="search-box"><Icon name="search" size={19} /><input placeholder="Buscar por nombre o registro" value={buscar} onChange={(e) => setBuscar(e.target.value)} /></div>
            <Field label="Rol en el equipo *" placeholder="Ej. Desarrollo frontend" />
            <div className="result-count">Proyecto: {proyecto.titulo}</div>
            <div className="card student-list">
              {estudiantesFiltrados.map((e, n) => {
                const ya = yaMiembros.has(e.id);
                return (
                  <div className="student-row" key={e.id}>
                    <Avatar name={e.nombre} small tone={(["blue", "green", "gold"] as const)[n % 3]} />
                    <div><strong>{e.nombre}</strong><span>{e.registro} · Sem. {e.semestre}</span></div>
                    {ya ? <span className="tag-muted">Ya es miembro</span> : (
                      <Button variant="secondary" onClick={() => confirmar({ title: "¿Agregar al equipo?", body: `${e.nombre} se unirá a "${proyecto.titulo}".`, confirm: "Agregar", toast: "Miembro agregado", onConfirm: () => { setProyectos((ps) => ps.map((p) => p.id === proyecto.id ? { ...p, miembros: [...p.miembros, { id: Date.now(), estudiante: e, rol: "Integrante", es_lider: false }] } : p)); go("EST_DetalleProyecto"); } })}>Agregar</Button>
                    )}
                  </div>
                );
              })}
            </div>
          </AppScreen>
        );
      }

      case "EST_Perfil":
        return (
          <ProfileScreen role="student" go={go} onLogout={cerrarSesion} name={yo.nombre} lines={[
            ["Usuario", yo.username],
            ["Correo institucional", `${yo.username}@uno.edu.bo`],
            ["Registro", yo.registro],
            ["Carrera", carrera],
            ["Facultad", facultad],
            ["Semestre", `${yo.semestre}.º semestre`],
            ["PPA", yo.ppa.toFixed(2)],
            ["Fecha de nacimiento", yo.fecha_nacimiento],
          ]} />
        );

      case "DOC_Inicio": {
        const cuenta = (e: EstadoNombre) => proyectos.filter((p) => p.estado === e).length;
        return (
          <AppScreen nav={teacherNav("Inicio")}>
            <div className="home-header"><div><span>Buenos días,</span><div className="page-title">{primerNombre(docente.nombre)}</div></div><img className="home-logo" src={logoColor} alt="UNO" /></div>
            <div className="teacher-card"><div className="teacher-card-top"><Avatar name={docente.nombre} /><div><strong>{docente.nombre}</strong><span>{docente.especialidad}</span></div></div><div className="faculty-line"><Icon name="graduation" size={18} /> {docente.facultad}</div></div>
            <SectionTitle title="Proyectos que tutoro" action="Ver todos" onAction={() => go("DOC_Proyectos")} />
            <div className="counter-grid"><Counter value={cuenta("En progreso")} label="En progreso" tone="blue" /><Counter value={cuenta("Pendiente")} label="Pendientes" tone="gold" /><Counter value={cuenta("Finalizado")} label="Finalizados" tone="green" /></div>
            <SectionTitle title="Actualizados recientemente" />
            <div className="card activity-list">
              {proyectos.map((p, n) => (
                <button key={p.id} className="activity" onClick={() => abrirProyecto(p.id, "DOC_DetalleProyecto")}>
                  <Avatar name={p.autor} small tone={(["blue", "green", "gold"] as const)[n % 3]} />
                  <div><strong>{p.titulo}</strong><span>{p.autor} · {p.actualizado}</span></div>
                  <StatusChip status={p.estado} />
                </button>
              ))}
            </div>
          </AppScreen>
        );
      }

      case "DOC_Proyectos": {
        const lista = proyectos.filter((p) => filtroEstado === "Todos" || p.estado === filtroEstado);
        return (
          <AppScreen nav={teacherNav("Proyectos")}>
            <TopBar title="Proyectos que tutoro" />
            <div className="chip-filter">{["Todos", ...estados].map((f) => <button key={f} className={filtroEstado === f ? "active" : ""} aria-pressed={filtroEstado === f} onClick={() => setFiltroEstado(f)}>{f}</button>)}</div>
            {lista.length === 0 ? <EmptyState icon="folder" title="Sin proyectos en este estado" text="Cambia el filtro para ver otros proyectos." /> : (
              <div className="list-stack">
                {lista.map((p) => <ProjectCard key={p.id} p={p} subtitle={`${p.autor} · ${p.miembros.length} integrantes`} onClick={() => abrirProyecto(p.id, "DOC_DetalleProyecto")} />)}
              </div>
            )}
          </AppScreen>
        );
      }

      case "DOC_Estudiantes":
        return (
          <AppScreen nav={teacherNav("Estudiantes")}>
            <TopBar title="Estudiantes" />
            <div className="search-box"><Icon name="search" size={19} /><input placeholder="Buscar por nombre o registro" value={buscar} onChange={(e) => setBuscar(e.target.value)} /></div>
            <div className="result-count">{estudiantesFiltrados.length} estudiantes · Solo consulta</div>
            <div className="card student-list">
              {estudiantesFiltrados.map((e, n) => (
                <button key={e.id} className="student-row" onClick={() => { setEstudianteId(e.id); setTabFicha("materias"); go("DOC_FichaEstudiante"); }}>
                  <Avatar name={e.nombre} small tone={(["blue", "green", "gold"] as const)[n % 3]} />
                  <div><strong>{e.nombre}</strong><span>{e.registro} · Sem. {e.semestre}</span></div>
                  <div className="gpa"><span>PPA</span><strong>{e.ppa.toFixed(2)}</strong></div>
                  <Icon name="chevron" size={17} />
                </button>
              ))}
            </div>
          </AppScreen>
        );

      case "DOC_FichaEstudiante": {
        const susProyectos = proyectos.filter((p) => p.miembros.some((m) => m.estudiante.id === estudiante.id));
        const susMaterias = estudiante.id === yo.id ? inscripciones.map((i) => i.materia) : inscripcionesIniciales.slice(0, 3).map((i) => i.materia);
        return (
          <AppScreen>
            <TopBar title="Ficha del estudiante" back={() => go("DOC_Estudiantes")} />
            <div className="student-profile"><Avatar name={estudiante.nombre} /><div className="card-title">{estudiante.nombre}</div><span>{carrera} · {estudiante.semestre}.º semestre</span><div className="student-facts"><div><span>Registro</span><strong>{estudiante.registro}</strong></div><div><span>PPA</span><strong className="green-text">{estudiante.ppa.toFixed(2)}</strong></div></div></div>
            <div className="tabs-inline" role="tablist">
              <button role="tab" aria-selected={tabFicha === "materias"} className={tabFicha === "materias" ? "active" : ""} onClick={() => setTabFicha("materias")}>Materias inscritas <span>{susMaterias.length}</span></button>
              <button role="tab" aria-selected={tabFicha === "proyectos"} className={tabFicha === "proyectos" ? "active" : ""} onClick={() => setTabFicha("proyectos")}>Proyectos <span>{susProyectos.length}</span></button>
            </div>
            {tabFicha === "materias" ? (
              <div className="card compact-subjects">{susMaterias.map((m) => <SubjectMini key={m.id} materia={m} />)}</div>
            ) : susProyectos.length === 0 ? <EmptyState icon="folder" title="Sin proyectos" text="Este estudiante aún no participa en proyectos." /> : (
              <div className="list-stack">{susProyectos.map((p) => <ProjectCard key={p.id} p={p} subtitle={p.miembros.find((m) => m.estudiante.id === estudiante.id)?.rol ?? ""} onClick={() => abrirProyecto(p.id, "DOC_DetalleProyecto")} />)}</div>
            )}
          </AppScreen>
        );
      }

      case "DOC_Perfil":
        return (
          <ProfileScreen role="teacher" go={go} onLogout={cerrarSesion} name={docente.nombre} lines={[
            ["Usuario", docente.username],
            ["Correo institucional", docente.email],
            ["Especialidad", docente.especialidad],
            ["Facultad", docente.facultad],
          ]} />
        );
    }
  };

  return (
    <div className="prototype-page">
      <div className="prototype-toolbar">
        <div><span>PROTOTIPO · APP UNO</span><strong>{screen}</strong></div>
        <label>Pantalla<select value={screen} onChange={(e) => go(e.target.value as Screen)}>{frames.map((frame) => <option key={frame}>{frame}</option>)}</select></label>
      </div>
      <div className="phone-frame">
        {renderScreen()}
        {dialog && <ConfirmDialog d={dialog} onClose={cerrarDialogo} />}
        {toast && <div className="toast" role="status"><Icon name="check" size={16} />{toast}</div>}
      </div>
      <div className="api-panel">
        <span>API /api/v1</span>
        <ul>{endpoints[screen].map((e) => <li key={e}>{e}</li>)}</ul>
      </div>
      <div className="prototype-footer">{institucion} · App para estudiantes y docentes · La administración (usuarios, roles, estructura académica) es exclusiva del sistema web.</div>
    </div>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="section-title"><strong>{title}</strong>{action && (onAction ? <button onClick={onAction}>{action}</button> : <span>{action}</span>)}</div>;
}

function QuickAction({ icon, label, tone, onClick }: { icon: IconName; label: string; tone: string; onClick: () => void }) {
  return <button className="quick-action" onClick={onClick}><span className={`quick-icon quick-icon--${tone}`}><Icon name={icon} /></span><span>{label}</span></button>;
}

function SubjectCard({ materia, date, tone, onDrop }: { materia: Materia; date: string; tone: string; onDrop: () => void }) {
  return (
    <div className="card subject-card">
      <div className={`subject-code subject-code--${tone}`}>{materia.codigo.slice(0, 3)}</div>
      <div className="subject-info"><span>{materia.codigo}</span><strong>{materia.nombre}</strong><small><Icon name="calendar" size={14} /> Inscrita el {date}</small></div>
      <div className="credits"><strong>{materia.creditos}</strong><span>CR</span></div>
      <button className="drop-button" onClick={onDrop} aria-label={`Dar de baja ${materia.nombre}`}><Icon name="trash" size={17} /></button>
    </div>
  );
}

function EnrollCard({ materia, inscrita, onClick }: { materia: Materia; inscrita: boolean; onClick: () => void }) {
  return (
    <div className="card enroll-card">
      <div><span>{materia.codigo}</span><strong>{materia.nombre}</strong><small>{materia.creditos} créditos · {materia.semestre_materia}.º semestre</small></div>
      {inscrita ? <span className="tag-done"><Icon name="check" size={14} />Inscrita</span> : <Button variant="secondary" onClick={onClick}>Inscribirme</Button>}
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return <div className="detail-item"><span className="detail-icon"><Icon name={icon} size={19} /></span><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function Member({ name, role, tone = "blue", leader = false, onRemove }: { name: string; role: string; tone?: "blue" | "green" | "gold"; leader?: boolean; onRemove?: () => void }) {
  return (
    <div className="member">
      <Avatar name={name} tone={tone} small />
      <div><strong>{name}</strong><span>{role}</span></div>
      {leader && <span className="leader-star" aria-label="Líder"><Icon name="star" size={19} filled /></span>}
      {onRemove && <button className="drop-button" onClick={onRemove} aria-label={`Quitar a ${name}`}><Icon name="close" size={17} /></button>}
    </div>
  );
}

function EmptyState({ icon, title, text, action, onClick }: { icon: IconName; title: string; text: string; action?: string; onClick?: () => void }) {
  return <div className="empty-state"><div className="empty-illustration"><Icon name={icon} size={40} /><span><Icon name="plus" size={18} /></span></div><div className="card-title">{title}</div><p>{text}</p>{action && <Button onClick={onClick} icon="plus">{action}</Button>}</div>;
}

function Counter({ value, label, tone }: { value: number; label: string; tone: string }) {
  return <div className={`counter counter--${tone}`}><strong>{value}</strong><span>{label}</span></div>;
}

function SubjectMini({ materia }: { materia: Materia }) {
  return <div className="subject-mini"><div><span>{materia.codigo}</span><strong>{materia.nombre}</strong></div><div><span>Créditos</span><strong>{materia.creditos}</strong></div></div>;
}

function ProfileScreen({ role, go, onLogout, name, lines }: { role: "student" | "teacher"; go: (screen: Screen) => void; onLogout: () => void; name: string; lines: [string, string][] }) {
  const student = role === "student";
  return (
    <AppScreen nav={<BottomNav role={role} active="Perfil" go={go} />}>
      <TopBar title="Mi perfil" />
      <div className="profile-hero"><Avatar name={name} tone={student ? "blue" : "gray"} /><div className="card-title">{name}</div><span>{student ? "Estudiante" : "Docente"} · Cuenta activa</span></div>
      <div className="card profile-data">{lines.map(([l, v]) => <ProfileLine key={l} label={l} value={v} />)}</div>
      <Note icon="lock">Tus datos los administra Dirección Académica desde el sistema web. Si hay un error, solicita la corrección allí.</Note>
      <Button variant="danger" icon="logout" onClick={onLogout}>Cerrar sesión</Button>
      <div className="app-version">UNO App Académica · v1.1</div>
    </AppScreen>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return <div className="profile-line"><span>{label}</span><strong>{value}</strong></div>;
}
