document.addEventListener('DOMContentLoaded', () => {
    // Global state for current log entry
    let currentLogData = {
        substance: '',
        dose: '',
        tasks: []
    };

    const getSavedLogs = () => JSON.parse(localStorage.getItem('poolLogs') || '[]');
    const saveLogs = (logs) => localStorage.setItem('poolLogs', JSON.stringify(logs));

    // Base de datos de dosificación de químicos de acuerdo a la Tabla Práctica (por cada 10,000 Litros de agua)
    const CHEMICALS_DB = {
        hipo65: { name: "Hipoclorito de calcio 65%", factor: 10, baseUnit: "g", finalUnit: "Kg" },
        hipo90: { name: "Hipoclorito de calcio 90%", factor: 7, baseUnit: "g", finalUnit: "Kg" },
        tricloro75: { name: "Ácido tricloro 75%", factor: 8, baseUnit: "g", finalUnit: "Kg" },
        tricloro90: { name: "Ácido tricloro 90%", factor: 6, baseUnit: "g", finalUnit: "Kg" },
        bromo: { name: "Bromo 60%", factor: 8, baseUnit: "g", finalUnit: "Kg" },
        sube_ph: { name: "Sube pH (Carbonato de sodio)", factor: 100, baseUnit: "g", finalUnit: "Kg" },
        baja_ph: { name: "Baja pH (Bisulfato de sodio)", factor: 100, baseUnit: "g", finalUnit: "Kg" },
        ac_clor: { name: "Ácido clorhídrico 31-33%", factor: 125, baseUnit: "ml", finalUnit: "L" }, // Rango medio de 100 - 150 mL (125 mL)
        ac_clor30: { name: "Ácido clorhídrico 30%", factor: 150, baseUnit: "ml", finalUnit: "L" }, // Rango medio de 120 - 180 mL (150 mL)
        bicarbonato: { name: "Bicarbonato de sodio", factor: 180, baseUnit: "g", finalUnit: "Kg" },
        algicida: { name: "Algicida", factor: 5, baseUnit: "ml", finalUnit: "L" },
        clarificador: { name: "Clarificador", factor: 3, baseUnit: "ml", finalUnit: "L" },
        floculante: { name: "Floculante / Precipitador", factor: 5, baseUnit: "ml", finalUnit: "L" },
        abrillantador: { name: "Abrillantador", factor: 3, baseUnit: "ml", finalUnit: "L" }
    };

    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            
            // Update Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show Target Section
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                if (targetSection.innerHTML === '') {
                    renderSection(sectionId);
                }
            }

            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Escape key closes dosif lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lb = document.getElementById('dosif-lightbox');
            if (lb && lb.style.display === 'flex') {
                lb.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });

    function goToSection(id) {
        const link = document.querySelector(`.nav-links a[data-section="${id}"]`);
        if (link) link.click();
    }


    // Content Rendering System
    function renderSection(id) {
        const container = document.getElementById(id);
        switch(id) {
            case 'higiene': renderHigiene(container); break;
            case 'tipos': renderTipos(container); break;
            case 'partes': renderPartes(container); break;
            case 'mantenimiento': renderMantenimiento(container); break;
            case 'quimica': renderQuimica(container); break;
            case 'herramientas': renderHerramientas(container); break;
            case 'operacion': renderOperacion(container); break;
            case 'gestion': renderGestion(container); break;
        }
    }

    function renderHigiene(container) {
        container.innerHTML = `
            <h2 class="section-title">🛡️ Principios de Higiene y Seguridad</h2>
            <div class="card">
                <p>Garantizar un ambiente saludable y prevenir enfermedades o accidentes es fundamental.</p>
                <div class="grid-3" style="margin-top: 1.5rem; gap: 1rem;">
                    <div class="info-box" style="text-align: center;">
                        <img src="water_quality.png" alt="Calidad del Agua" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                        <h4><span class="badge badge-primary">1</span> Calidad del Agua</h4>
                        <p>Limpia, desinfectada y equilibrada químicamente (cloro y pH).</p>
                    </div>
                    <div class="info-box" style="text-align: center;">
                        <img src="pool_cleaning.png" alt="Limpieza Constante" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                        <h4><span class="badge badge-primary">2</span> Limpieza Constante</h4>
                        <p>Retirar residuos y cepillar paredes/fondo para evitar algas.</p>
                    </div>
                    <div class="info-box" style="text-align: center;">
                        <img src="pool_disinfection.png" alt="Desinfección Adecuada" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                        <h4><span class="badge badge-primary">3</span> Desinfección Adecuada</h4>
                        <p>Uso esencial de cloro o alguicidas para eliminar contaminantes.</p>
                    </div>
                    <div class="info-box" style="text-align: center;">
                        <img src="user_hygiene.png" alt="Higiene del Usuario" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                        <h4><span class="badge badge-primary">4</span> Higiene del Usuario</h4>
                        <p>Ducha previa y evitar el ingreso con enfermedades contagiosas.</p>
                    </div>
                    <div class="info-box" style="text-align: center;">
                        <img src="pool_rules.png" alt="Señalización y Reglas" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                        <h4><span class="badge badge-primary">5</span> Señalización y Reglas</h4>
                        <p>Contar con señalamientos visibles sobre el reglamento y precauciones.</p>
                    </div>
                    <div class="info-box" style="text-align: center;">
                        <img src="pool_safety.png" alt="Primeros Auxilios" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">
                        <h4><span class="badge badge-primary">6</span> Primeros Auxilios</h4>
                        <p>Disponibilidad de botiquín y equipos de rescate accesibles.</p>
                    </div>
                </div>
                <div class="alert warning" style="margin-top: 1.5rem; background: #fffaf0; padding: 1rem; border-left: 4px solid var(--warning); border-radius: 4px;">
                    <strong>⚠️ Seguridad con Químicos:</strong> Manipular con guantes, gafas y mascarilla. Almacenar en lugares secos y frescos.
                </div>

                <!-- ACCIONES QUE DEBEN EVITARSE -->
                <div style="margin-top: 1.5rem;">
                    <h3 style="color: #b91c1c; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">🚫 Acciones que Deben Evitarse Durante el Mantenimiento</h3>
                    <div class="grid-2" style="gap:1rem;">

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">1. Mezclar químicos directamente</h4>
                            <p style="font-size:0.88rem;">Nunca mezclar sustancias como <strong>Cloro con Ácido clorhídrico</strong>. Puede generar <strong>gases tóxicos</strong> (cloro gaseoso).</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">2. Aplicarlos sin diluir (cuando se requiere)</h4>
                            <p style="font-size:0.88rem;">Productos como ácidos o floculantes deben diluirse antes. Evita daños en el recubrimiento y reacciones bruscas.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">3. No usar protección personal</h4>
                            <p style="font-size:0.88rem;">Evita trabajar sin:<br>🧤 Guantes &nbsp;•&nbsp; 🥽 Lentes de seguridad &nbsp;•&nbsp; 😷 Cubrebocas (en polvo o vapores)</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">4. Dosificar "al tanteo"</h4>
                            <p style="font-size:0.88rem;">Nunca aplicar químicos sin medir previamente <strong>pH y cloro</strong>. Sobredosificar puede irritar piel y ojos o dañar el agua.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">5. Aplicar varios químicos al mismo tiempo</h4>
                            <p style="font-size:0.88rem;">Ejemplo: Sulfato de aluminio + cloro. Puede reducir la efectividad o generar reacciones indeseadas.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">6. Almacenarlos incorrectamente</h4>
                            <p style="font-size:0.88rem;">Evitar: lugares húmedos, exposición al sol y envases abiertos. El <strong>Hipoclorito de sodio</strong> pierde efectividad con el tiempo.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">7. Inhalar vapores o polvo</h4>
                            <p style="font-size:0.88rem;">Especial cuidado con: <strong>Cloro</strong> y <strong>Ácido clorhídrico</strong>. Pueden irritar vías respiratorias.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">8. Agregar químicos con personas dentro</h4>
                            <p style="font-size:0.88rem;">Siempre aplicar cuando la alberca esté <strong>vacía de bañistas</strong>. Evita irritaciones y accidentes.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">9. No respetar tiempos de espera</h4>
                            <p style="font-size:0.88rem;">Después de aplicar químicos: esperar <strong>mínimo 30 min – 2 horas</strong> según el producto antes de permitir el acceso.</p>
                        </div>

                        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:1rem;">
                            <h4 style="color:#b91c1c; margin-bottom:0.5rem;">10. Usar recipientes contaminados</h4>
                            <p style="font-size:0.88rem;">No reutilizar envases de otros químicos. Puede haber <strong>reacciones peligrosas</strong>.</p>
                        </div>

                    </div>

                    <!-- Reglas de oro -->
                    <div style="margin-top:1.2rem; background: linear-gradient(135deg, #1e3a5f, #2563eb); color:white; border-radius:12px; padding:1.2rem 1.5rem;">
                        <h4 style="color:#fbbf24; margin-bottom:0.8rem; font-size:1rem;">⭐ Reglas Básicas de Oro</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:0.6rem; font-size:0.88rem;">
                            <span style="background:rgba(255,255,255,0.15); padding:5px 12px; border-radius:20px;">1️⃣ Primero medir, luego dosificar</span>
                            <span style="background:rgba(255,255,255,0.15); padding:5px 12px; border-radius:20px;">2️⃣ Aplicar uno por uno</span>
                            <span style="background:rgba(255,255,255,0.15); padding:5px 12px; border-radius:20px;">3️⃣ Mantener circulación del agua</span>
                            <span style="background:rgba(255,255,255,0.15); padding:5px 12px; border-radius:20px;">4️⃣ Leer siempre la etiqueta del producto</span>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    function renderTipos(container) {
        container.innerHTML = `
            <h2 class="section-title">🏊 Tipos y Capacidad</h2>
            <div class="grid-2">
                <div class="card">
                    <h3>Clasificación de Albercas</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>Tipo</th><th>Características</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Residencial</td><td>Uso doméstico, pequeña, mantenimiento sencillo.</td></tr>
                                <tr><td>Pública</td><td>Uso colectivo, normas estrictas de higiene.</td></tr>
                                <tr><td>Semiolímpica</td><td>25 m de longitud, uso deportivo.</td></tr>
                                <tr><td>Olímpica</td><td>50 m de longitud, uso profesional.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card">
                    <h3>Calculadora de Volumen</h3>
                    <div class="calc-form">
                        <div class="form-group">
                            <label>Largo (m)</label>
                            <input type="number" id="v-largo" placeholder="Ej: 50" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Ancho (m)</label>
                            <input type="number" id="v-ancho" placeholder="Ej: 25" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Profundidad Promedio (m)</label>
                            <input type="number" id="v-prof" placeholder="Ej: 2" class="form-control">
                        </div>
                        <button onclick="calcVol()" class="btn-calc" style="width:100%; padding:1rem; background: var(--primary); color:white; border:none; border-radius:8px; margin-top:1rem; cursor:pointer;">Calcular</button>
                        <div id="v-result" class="result-box" style="margin-top:1rem; padding:1rem; background: #e0f2fe; border-radius:8px; display:none; text-align:center;">
                            <p style="font-weight:700; color:var(--primary); font-size:1.2rem;">Resultado: <span id="res-val">0</span> m³</p>
                            <p id="res-liters" style="font-size:0.9rem; color:var(--primary-light);">0 litros</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderPartes(container) {
        container.innerHTML = `
            <h2 class="section-title">🏗️ Partes de la Alberca</h2>
            <div class="card">
                <p style="margin-bottom: 1rem;">Una alberca está formada por varios componentes que permiten almacenar, limpiar y recircular el agua de manera segura.</p>
                
                <div style="margin-bottom: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                    <ul style="padding-left: 1.2rem; font-size: 0.95rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        <li><strong>Vaso:</strong> Estructura principal (concreto, fibra, etc.).</li>
                        <li><strong>Skimmers:</strong> Recogen suciedad flotante.</li>
                        <li><strong>Drenaje:</strong> Succiona agua del fondo.</li>
                        <li><strong>Boquillas:</strong> Retorno de agua filtrada.</li>
                        <li><strong>Sistema de bombeo (bomba):</strong> Impulsa el agua hacia el filtro y permite su recirculación continua.</li>
                        <li><strong>Sistema de filtración (filtro):</strong> Elimina impurezas del agua. Puede ser de arena, cartucho o diatomeas.</li>
                        <li><strong>Tuberías y válvulas:</strong> Conectan todo el sistema hidráulico y controlan el flujo del agua.</li>
                        <li><strong>Cuarto de máquinas:</strong> Espacio donde se encuentran la bomba, el filtro y otros equipos.</li>
                    </ul>
                </div>

                <div style="text-align: center;">
                    <img src="Partes_alberca_1.jpg?v=2" alt="Diagrama de partes" style="width: 100%; max-width: 900px; height: auto; border-radius: 12px; box-shadow: var(--shadow-md); border: 1px solid #e2e8f0;">
                </div>
            </div>
        `;
    }

    function renderMantenimiento(container) {
        container.innerHTML = `
            <h2 class="section-title">🛠️ Tipos de Mantenimiento</h2>
            
            <div class="grid-2" style="margin-bottom: 2.5rem; align-items: start;">
                <!-- MANTENIMIENTO PREVENTIVO -->
                <div class="card" style="border-top: 6px solid var(--success); transition: var(--transition); box-shadow: var(--shadow-md); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; padding: 1rem; font-size: 3rem; opacity: 0.08; pointer-events: none; font-weight: bold; color: var(--success);">🛡️</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                        <span style="font-size: 1.75rem;">🛡️</span>
                        <h3 class="text-success" style="font-size: 1.5rem; font-weight: 700; margin: 0;">Mantenimiento Preventivo</h3>
                    </div>
                    
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Actividades planificadas y sistemáticas ejecutadas periódicamente con el fin de evitar fallas, optimizar el rendimiento y prolongar la vida útil de la alberca.</p>
                    
                    <div class="table-container" style="margin: 1rem 0;">
                        <table style="font-size: 0.9rem;">
                            <thead>
                                <tr style="background: #f0fdf4;"><th style="color: var(--success); width: 30%;">Aspecto</th><th style="color: var(--success);">Descripción</th></tr>
                            </thead>
                            <tbody>
                                <tr><td><strong>Objetivo</strong></td><td>Prevenir problemas antes de que ocurran</td></tr>
                                <tr><td><strong>Frecuencia</strong></td><td><span class="badge" style="background: #dcfce7; color: #15803d;">Diaria, semanal o mensual</span></td></tr>
                                <tr><td><strong>Ventajas</strong></td><td style="color: #15803d; font-weight: 500;">Reduce costos, prolonga la vida útil de equipos, mantiene el agua en buen estado de manera constante</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <h4 style="color: var(--primary); font-size: 1.05rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px;">📋 Actividades de Rutina</h4>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 3px solid var(--success);">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--success);">✔</span> Limpieza de superficie</div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--success);">✔</span> Cepillado de paredes y piso</div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--success);">✔</span> Aspirado del fondo</div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--success);">✔</span> Medición constante de pH y cloro libre</div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--success);">✔</span> Revisión operativa de bomba y filtro</div>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <h4 style="color: var(--primary); font-size: 1.05rem; margin-bottom: 0.75rem;">💡 Ejemplos Prácticos</h4>
                        <ul style="padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-dark); line-height: 1.7;">
                            <li>Medir y ajustar los niveles químicos diariamente para cumplir la norma.</li>
                            <li>Limpiar a fondo los skimmers y las canastillas para asegurar el flujo.</li>
                            <li>Retrolavar el filtro cuando la presión aumente de forma segura.</li>
                            <li>Aplicar dosis controladas de cloro y alguicida preventivo.</li>
                        </ul>
                    </div>
                </div>

                <!-- MANTENIMIENTO CORRECTIVO -->
                <div class="card" style="border-top: 6px solid var(--danger); transition: var(--transition); box-shadow: var(--shadow-md); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; right: 0; padding: 1rem; font-size: 3rem; opacity: 0.08; pointer-events: none; font-weight: bold; color: var(--danger);">🚨</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                        <span style="font-size: 1.75rem;">🚨</span>
                        <h3 class="text-danger" style="font-size: 1.5rem; font-weight: 700; margin: 0;">Mantenimiento Correctivo</h3>
                    </div>
                    
                    <!-- REPORTE DE ANOMALÍAS (USER NOTE) -->
                    <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid var(--danger);">
                        <strong style="color: #c53030; font-size: 0.9rem; display: block; margin-bottom: 4px;">📝 REPORTE DE ANOMALÍAS DETECTADAS:</strong>
                        <p style="margin: 0; font-size: 0.85rem; color: #9b2c2c; line-height: 1.4;">
                            Antes de realizar cualquier acción correctiva, es de carácter obligatorio hacer un reporte detallado que describa con precisión las anomalías detectadas, fallas o daños estructurales y mecánicos para su correcta evaluación y seguimiento.
                        </p>
                    </div>

                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">Acciones tomadas para resolver problemas, fallas o daños imprevistos en la infraestructura, sistema hidráulico o en las condiciones biológicas del agua.</p>

                    <div class="table-container" style="margin: 1rem 0;">
                        <table style="font-size: 0.9rem;">
                            <thead>
                                <tr style="background: #fff5f5;"><th style="color: var(--danger); width: 30%;">Aspecto</th><th style="color: var(--danger);">Descripción</th></tr>
                            </thead>
                            <tbody>
                                <tr><td><strong>Objetivo</strong></td><td>Corregir daños o fallas existentes y restaurar la operación</td></tr>
                                <tr><td><strong>Frecuencia</strong></td><td><span class="badge" style="background: #fee2e2; color: #b91c1c;">Eventual (cuando ocurre un problema)</span></td></tr>
                                <tr><td><strong>Desventajas</strong></td><td style="color: #b91c1c; font-weight: 500;">Mayor costo financiero, posible suspensión del servicio o cierre de la alberca</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <h4 style="color: var(--primary); font-size: 1.05rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px;">🔧 Actividades de Corrección</h4>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px; border-left: 3px solid var(--danger);">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--danger);">🛠</span> Reparación urgente de fugas hidráulicas</div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--danger);">🛠</span> Cambio de equipos dañados o desgastados (bomba, válvulas)</div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;"><span style="color: var(--danger);">🛠</span> Tratamiento de choque para agua sumamente contaminada o verde</div>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem;">
                        <h4 style="color: var(--primary); font-size: 1.05rem; margin-bottom: 0.75rem;">💡 Ejemplos Prácticos</h4>
                        <ul style="padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-dark); line-height: 1.7;">
                            <li>Reparación o bobinado de motor de la bomba dañada.</li>
                            <li>Supercloración o floculación extrema para eliminación de agua verde (algas).</li>
                            <li>Corrección de fisuras en el vaso o fugas en las tuberías del cuarto de máquinas.</li>
                            <li>Sustitución inmediata de filtros de arena agrietados o válvulas multivía rotas.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Galería de apoyo visual -->
            <div class="grid-2" style="margin-top: 1rem;">
                <div class="card" style="text-align: center; padding: 1rem; border-radius: var(--radius); transition: var(--transition);">
                    <img src="Mantenimiento_diario.jpeg" alt="Mantenimiento Diario" style="width: 100%; max-width: 450px; height: auto; border-radius: 8px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0; transition: var(--transition);">
                    <h4 style="margin-top: 0.75rem; color: var(--primary); font-weight: 600;">Rutina de Limpieza Preventiva</h4>
                </div>
                <div class="card" style="text-align: center; padding: 1rem; border-radius: var(--radius); transition: var(--transition);">
                    <img src="Mantenimiento_semanal.jpeg" alt="Mantenimiento Semanal" style="width: 100%; max-width: 450px; height: auto; border-radius: 8px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0; transition: var(--transition);">
                    <h4 style="margin-top: 0.75rem; color: var(--primary); font-weight: 600;">Monitoreo Semanal de Parámetros</h4>
                </div>
            </div>
        `;
    }

    function renderQuimica(container) {
        container.innerHTML = `
            <h2 class="section-title">⚖️ Control Químico (<a href="NORMA Oficial Mexicana NOM-245-SSA1-2010, Requisitos sanitarios y calidad del agua que deben cumplir las albercas.html" target="_blank" style="color: inherit; text-decoration: underline;" title="Ver Norma Oficial Mexicana">NOM-245</a>)</h2>
            <div class="card">
                <h3>Parámetros Normativos</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr><th>Parámetro</th><th>Rango Ideal</th><th>Frecuencia</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>pH</td><td>6.5 – 8.5</td><td>Cada 4 horas</td></tr>
                            <tr><td>Cloro Residual</td><td>1.0 – 5.0 mg/L</td><td>Cada 4 horas</td></tr>
                            <tr><td>Turbidez</td><td>< 5 UTN</td><td>Diario</td></tr>
                            <tr><td>Cloraminas</td><td>0.0 - 0.5 mg/L</td><td>Semanal</td></tr>
                            <tr><td>Alcalinidad</td><td>80 – 120 ppm</td><td>Semanal</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- Instrumentos de Medición -->
            <div class="card" style="margin-top: 1.5rem;">
                <h3 style="display:flex; align-items:center; gap:0.5rem;">📏 Instrumentos de Medición</h3>
                <p style="color:var(--text-light); margin-bottom:1.5rem;">Para mantener una alberca en condiciones óptimas, es necesario medir regularmente parámetros como pH, cloro, alcalinidad y dureza. Esto se realiza con diferentes herramientas según el nivel de precisión requerido.</p>

                <div class="grid-3" style="gap:1.2rem;">

                    <!-- Tiras Reactivas -->
                    <div class="card" style="border: 1px solid #e2e8f0; padding: 1.2rem; border-radius: 10px; text-align:center;">
                        <img src="Tiras_reactivas.jpeg" alt="Tiras Reactivas" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="color:var(--primary); margin-bottom:0.3rem;">🧪 Tiras Reactivas</h4>
                        <p style="font-size:0.82rem; color:var(--text-light); margin-bottom:0.8rem; font-style:italic;">Uso rápido y práctico</p>
                        <div style="text-align:left; font-size:0.88rem;">
                            <p style="margin-bottom:0.4rem;"><strong>¿Cómo se usan?</strong><br>Se sumergen en el agua durante 1–2 segundos y luego se comparan los colores con una escala.</p>
                            <p style="margin-bottom:0.4rem;"><strong>¿Qué miden?</strong><br>pH, cloro, alcalinidad, dureza, ácido cianúrico.</p>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Fáciles de usar</span>
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Económicas</span>
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Resultados en segundos</span>
                                <span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✖ Menor precisión</span>
                            </div>
                        </div>
                    </div>

                    <!-- Kits de análisis -->
                    <div class="card" style="border: 1px solid #e2e8f0; padding: 1.2rem; border-radius: 10px; text-align:center;">
                        <img src="Colorimetro.jpeg" alt="Kits Líquidos" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="color:var(--primary); margin-bottom:0.3rem;">🧫 Kits de Análisis</h4>
                        <p style="font-size:0.82rem; color:var(--text-light); margin-bottom:0.8rem; font-style:italic;">Uso más preciso y confiable</p>
                        <div style="text-align:left; font-size:0.88rem;">
                            <p style="margin-bottom:0.4rem;"><strong>¿Cómo se usan?</strong><br>Se llena un tubo con agua de la alberca y se agregan gotas de reactivos que cambian de color.</p>
                            <p style="margin-bottom:0.4rem;"><strong>¿Qué miden?</strong><br>Principalmente pH y cloro (libre y total).</p>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Mayor precisión</span>
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Resultados confiables</span>
                                <span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✖ Requiere más tiempo</span>
                                <span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✖ Manejo cuidadoso</span>
                            </div>
                        </div>
                    </div>

                    <!-- Equipos Digitales -->
                    <div class="card" style="border: 1px solid #e2e8f0; padding: 1.2rem; border-radius: 10px; text-align:center;">
                        <img src="Herramienta_digital.jpeg" alt="Digitales" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="color:var(--primary); margin-bottom:0.3rem;">📱 Equipos Digitales</h4>
                        <p style="font-size:0.82rem; color:var(--text-light); margin-bottom:0.8rem; font-style:italic;">Uso profesional y de alta precisión</p>
                        <div style="text-align:left; font-size:0.88rem;">
                            <p style="margin-bottom:0.4rem;"><strong>¿Cómo se usan?</strong><br>Se introduce un sensor en el agua y el equipo muestra el resultado en pantalla.</p>
                            <p style="margin-bottom:0.4rem;"><strong>¿Qué miden?</strong><br>pH, cloro, ORP (potencial de oxidación), conductividad, temperatura.</p>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.6rem;">
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Alta precisión</span>
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Lectura inmediata</span>
                                <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✔ Ideal para albercas grandes</span>
                                <span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✖ Costo elevado</span>
                                <span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:20px; font-size:0.78rem;">✖ Requieren calibración</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Pasos básicos para medir correctamente -->
                <div style="margin-top:1.8rem; background:#f0f9ff; border-radius:10px; padding:1.2rem; border-left:4px solid var(--primary);">
                    <h4 style="color:var(--primary); margin-bottom:1rem;">📋 Pasos Básicos para Medir Correctamente</h4>
                    <ol style="padding-left:1.4rem; font-size:0.9rem; display:grid; gap:0.4rem;">
                        <li>Tomar la muestra a <strong>30 cm de profundidad</strong></li>
                        <li>Evitar zonas cercanas a retornos o skimmers</li>
                        <li>Usar la herramienta elegida (tira, kit o equipo digital)</li>
                        <li>Comparar o leer resultados</li>
                        <li>Registrar los valores obtenidos</li>
                    </ol>
                </div>

                <!-- Recomendaciones de medición -->
                <div style="margin-top:1.2rem; background:#fefce8; border-radius:10px; padding:1.2rem; border-left:4px solid var(--warning);">
                    <h4 style="color:#92400e; margin-bottom:0.8rem;">💡 Recomendaciones</h4>
                    <ul style="padding-left:1.2rem; font-size:0.9rem; display:grid; gap:0.3rem;">
                        <li>Medir <strong>pH y cloro diariamente</strong></li>
                        <li>Revisar <strong>alcalinidad y dureza</strong> 1 vez por semana</li>
                        <li>Llevar un <strong>registro de control</strong></li>
                        <li>Calibrar equipos digitales regularmente</li>
                    </ul>
                </div>

            </div>
        `;
    }



    function renderHerramientas(container) {
        container.innerHTML = `
            <h2 class="section-title">🛠️ Materiales y Herramientas</h2>
            <div class="grid-2">
                <div class="card">
                    <h3>Equipo de Seguridad (EPP)</h3>
                    <p>Protege al personal durante el manejo de químicos.</p>
                    <div class="img-container" style="margin-top:1rem;">
                        <img src="safety-epp.jpg" alt="Equipo de seguridad" class="section-img">
                    </div>
                </div>
                <div class="card">
                    <h3>Herramientas de Limpieza</h3>
                    <div class="img-container" style="margin-top:0.5rem; margin-bottom:1rem;">
                        <img src="productos-de-limpieza-para-albercas-1024x683.webp" alt="Herramientas de limpieza" class="section-img">
                    </div>
                    <ul style="margin-top:0.5rem; font-size:0.9rem;">
                        <li><strong>Red:</strong> Retira hojas y residuos flotantes.</li>
                        <li><strong>Cepillo:</strong> Limpia paredes y fondo.</li>
                        <li><strong>Aspiradora:</strong> Elimina sedimentos profundos.</li>
                        <li><strong>Mango telescópico:</strong> Alcance ajustable.</li>
                    </ul>
                </div>
            </div>
        `;
    }



    function renderOperacion(container) {
        container.innerHTML = `
            <h2 class="section-title">⚙️ Operación de Equipo</h2>
            <div class="card">
                <div class="grid-2">
                    <div>
                        <h3>Sistemas de Bombeo y Filtración</h3>
                        <p>La bomba succiona el agua y el filtro la limpia. Son los componentes críticos para mantener el agua cristalina.</p>
                    </div>
                    <div class="img-container">
                        <img src="pool-equipment.jpg" alt="Equipos de bombeo" class="section-img">
                    </div>
                </div>
            </div>
            <div class="grid-2">
                <div class="card" style="text-align: center;">
                    <img src="Bomba.jpeg" alt="La Bomba" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;" onerror="this.src='pool-equipment.jpg'">
                    <h3>La Bomba</h3>
                    <p>Debe trabajar 6-8 horas diarias. Siempre con agua.</p>
                </div>
                <div class="card">
                    <h3>Válvula Multivía</h3>
                    <select id="valve-sel" class="form-control" onchange="updateValve()">
                        <option value="filtrar">1. Filtrar (Filter)</option>
                        <option value="retrolavado">2. Retrolavado (Backwash)</option>
                        <option value="enjuague">3. Enjuague (Rinse)</option>
                        <option value="desague">4. Desagüe (Waste)</option>
                        <option value="recircular">5. Recircular</option>
                        <option value="cerrado">6. Cerrado</option>
                    </select>

                    <!-- Interactive Valve Widget -->
                    <div class="valve-interactive-container">
                        <div class="valve-body">
                            <div class="valve-label label-filtrar">Filtrar</div>
                            <div class="valve-label label-enjuague">Enjuague</div>
                            <div class="valve-label label-desague">Desagüe</div>
                            <div class="valve-label label-cerrado">Cerrado</div>
                            <div class="valve-label label-retrolavado">Retro-<br>lavado</div>
                            <div class="valve-label label-recircular">Recircular</div>
                            
                            <div class="valve-handle" id="valve-handle">
                                <div class="handle-pointer"></div>
                                <div class="handle-center"></div>
                                <div class="handle-grip"></div>
                            </div>
                        </div>
                    </div>

                    <div id="valve-desc" class="info-box" style="margin-top:1rem; border-left:4px solid var(--primary);">
                        <strong>Filtrar:</strong> Operación normal.
                    </div>
                </div>
            </div>
        `;
    }

    function renderGestion(container) {
        const today = new Date().toISOString().split('T')[0];
        const pendingTasks = currentLogData.tasks.length > 0 ? currentLogData.tasks.join(', ') : '';
        const pendingDose = currentLogData.dose ? `${currentLogData.dose} de ${currentLogData.substance}` : '';

        container.innerHTML = `
            <h2 class="section-title">📊 Gestión Operativa y Bitácora</h2>
            
            <div class="grid-2">
                <!-- Registro Diario (Bitácora) -->
                <div class="card" style="border-top: 4px solid var(--primary);">
                    <h3>📝 Registro Diario</h3>
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" id="b-fecha" value="${today}" class="form-control">
                    </div>
                    <div class="grid-2">
                        <div class="form-group"><label>Cloro (ppm)</label><input type="number" id="b-cloro" step="0.1" class="form-control" placeholder="Ej: 1.5"></div>
                        <div class="form-group"><label>pH</label><input type="number" id="b-ph" step="0.1" class="form-control" placeholder="Ej: 7.4"></div>
                    </div>
                    <div class="form-group">
                        <label>Dosis Aplicada</label>
                        <input type="text" id="b-dosis" value="${currentLogData.dose ? pendingDose : ''}" class="form-control" placeholder="Ej: 10g de Cloro">
                    </div>
                    <div class="form-group">
                        <label>Actividades/Rutinas</label>
                        <textarea id="b-notas" class="form-control" rows="3" placeholder="Tareas realizadas">${currentLogData.tasks.length > 0 ? pendingTasks : ''}</textarea>
                    </div>
                    <button onclick="saveLogEntry()" class="btn-calc" style="width:100%; padding:1rem; background: var(--success); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700;">💾 Guardar Registro</button>
                    
                    <div style="margin-top:1rem; padding:1rem; background:#fff5f5; border:1px solid #feb2b2; border-radius:8px;">
                        <h4 class="text-danger" style="font-size:0.9rem; margin-bottom:0.5rem;">⚠️ Recordatorio Normativo</h4>
                        <ul style="padding-left:1.2rem; font-size:0.8rem; color:#c53030; margin:0;">
                            <li>Medir parámetros cada 4 horas.</li>
                            <li>Cloro ideal: 1.0 - 5.0 mg/L.</li>
                            <li>pH ideal: 6.5 - 8.5.</li>
                        </ul>
                    </div>
                </div>

                <!-- Herramientas Integradas -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Calculadora de Dosificación -->
                    <div class="card">
                        <h3>🧪 Calculadora de Dosificación</h3>
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Volumen (L)</label>
                                <input type="number" id="d-vol" value="10000" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Sustancia</label>
                                <select id="d-sub" class="form-control">
                                    <optgroup label="Desinfectantes">
                                        <option value="hipo65">Hipoclorito de calcio 65%</option>
                                        <option value="hipo90">Hipoclorito de calcio 90%</option>
                                        <option value="tricloro75">Ácido tricloro 75%</option>
                                        <option value="tricloro90">Ácido tricloro 90%</option>
                                        <option value="bromo">Bromo 60%</option>
                                    </optgroup>
                                    <optgroup label="Reguladores de pH y Estabilidad">
                                        <option value="sube_ph">Sube pH (Carbonato de sodio)</option>
                                        <option value="baja_ph">Baja pH (Bisulfato de sodio)</option>
                                        <option value="ac_clor">Ácido clorhídrico 31-33%</option>
                                        <option value="ac_clor30">Ácido clorhídrico 30%</option>
                                        <option value="bicarbonato">Bicarbonato de sodio</option>
                                    </optgroup>
                                    <optgroup label="Alguicidas y Clarificadores">
                                        <option value="algicida">Algicida</option>
                                        <option value="clarificador">Clarificador</option>
                                        <option value="floculante">Floculante / Precipitador</option>
                                        <option value="abrillantador">Abrillantador</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div class="grid-2">
                            <button onclick="calcDose()" class="btn-calc" style="width:100%; padding:0.8rem; background: var(--secondary); color:var(--primary); font-weight:700; border:none; border-radius:8px; cursor:pointer;">Calcular</button>
                            <button onclick="registerDoseInline()" id="btn-reg-dose" class="btn-calc" style="width:100%; padding:0.8rem; background: var(--primary); color:white; font-weight:700; border:none; border-radius:8px; cursor:pointer; display:none;">Copiar a Bitácora</button>
                        </div>
                        <div id="d-result" class="result-box" style="margin-top:1rem; padding:1rem; background: #f0fdf4; border-radius:8px; display:none; text-align:center;">
                            <p style="font-weight:700; color:var(--success); font-size:1.2rem; margin:0;"><span id="dose-val">0</span> <span id="dose-unit">g</span></p>
                            <p id="dose-sub-name" style="font-size:0.85rem; color:var(--text-muted); margin-top:2px; margin-bottom:0;"></p>
                        </div>
                    </div>

                    <!-- Rutinas de Trabajo -->
                    <div class="card">
                        <h3>📅 Rutinas de Trabajo</h3>
                        <div class="checklist" id="daily-checklist" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                            <label><input type="checkbox" value="Revisión visual"> Revisión visual</label>
                            <label><input type="checkbox" value="Medición pH/cloro"> Medición pH/cloro</label>
                            <label><input type="checkbox" value="Retiro residuos"> Retiro residuos</label>
                            <label><input type="checkbox" value="Limpieza skimmers"> Limpia skimmers</label>
                        </div>
                        <button onclick="registerRoutinesInline()" class="btn-calc" style="width:100%; padding:0.8rem; background: var(--primary); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700;">Copiar a Notas</button>
                    </div>
                </div>
            </div>

            <!-- Tabla Práctica de Dosificación -->
            <div class="card" id="dosif-card" style="margin-top: 1rem; border-top: 4px solid #0ea5e9; background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); box-shadow: 0 4px 20px rgba(14,165,233,0.12); overflow: hidden; transition: var(--transition);">
                <!-- Encabezado de la tarjeta -->
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #0369a1, #0ea5e9); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; box-shadow: 0 3px 8px rgba(3,105,161,0.35);">🧪</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.1rem; color: #0369a1; font-weight: 700;">Tabla Práctica de Dosificación</h3>
                            <p style="margin: 2px 0 0; font-size: 0.78rem; color: #64748b;">Productos químicos · Por cada 10,000 L de agua</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        <span style="background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #bae6fd;">Referencia rápida</span>
                        <button id="btn-dosif-toggle" onclick="toggleDosifTable()" style="background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; border: none; border-radius: 8px; padding: 7px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(3,105,161,0.3);">
                            <span id="dosif-btn-icon">🔍</span> <span id="dosif-btn-text">Ver tabla</span>
                        </button>
                    </div>
                </div>

                <!-- Descripción informativa con badges -->
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="background: #dcfce7; color: #15803d; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #bbf7d0;">🟢 Desinfección</span>
                    <span style="background: #fef9c3; color: #854d0e; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #fde68a;">🟡 Regulación pH</span>
                    <span style="background: #ede9fe; color: #6d28d9; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #ddd6fe;">🟣 Estabilidad Química</span>
                    <span style="background: #fee2e2; color: #b91c1c; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #fecaca;">🔴 Control de Algas</span>
                    <span style="background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid #bae6fd;">🔵 Clarificación</span>
                </div>

                <!-- Panel colapsable con la imagen -->
                <div id="dosif-panel" style="display: none; animation: fadeSlideDown 0.35s ease;">
                    <div style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,0.13); border: 1px solid #e2e8f0; background: #fff;">
                        <!-- Barra superior decorativa -->
                        <div style="height: 4px; background: linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8, #7dd3fc); border-radius: 12px 12px 0 0;"></div>
                        <img 
                            src="Tabla_practica_dosificacion.jpeg" 
                            alt="Tabla Práctica de Dosificación de Productos Químicos" 
                            id="dosif-img"
                            style="width: 100%; height: auto; display: block; cursor: zoom-in; transition: transform 0.3s ease;"
                            onclick="openDosifLightbox()"
                            title="Clic para ampliar"
                        >
                    </div>
                    <p style="text-align: center; margin-top: 0.6rem; font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span>🔎</span> Haz clic en la tabla para ampliarla a pantalla completa
                    </p>
                </div>

                <!-- Divider cuando está cerrado -->
                <div id="dosif-hint" style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px dashed #bae6fd; border-radius: 10px; padding: 0.85rem 1rem; display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="toggleDosifTable()">
                    <span style="font-size: 1.5rem;">📋</span>
                    <div>
                        <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: #0369a1;">Consulta las dosis recomendadas por producto</p>
                        <p style="margin: 2px 0 0; font-size: 0.75rem; color: #64748b;">Hipoclorito · Tricloro · Bromo · Ácidos · Algicidas · Clarificadores...</p>
                    </div>
                    <span style="margin-left: auto; font-size: 1.2rem; color: #0ea5e9;">▼</span>
                </div>
            </div>

            <!-- Modal Lightbox para la imagen -->
            <div id="dosif-lightbox" onclick="closeDosifLightbox()" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.88); z-index:9999; align-items:center; justify-content:center; padding:1rem; cursor:zoom-out; backdrop-filter: blur(4px);">
                <div style="position:relative; max-width:1100px; width:100%; animation: fadeSlideDown 0.3s ease;">
                    <button onclick="event.stopPropagation(); closeDosifLightbox()" style="position:absolute; top:-14px; right:-14px; background:#0369a1; color:white; border:none; border-radius:50%; width:36px; height:36px; font-size:1.1rem; cursor:pointer; z-index:10000; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.4);">✕</button>
                    <img src="Tabla_practica_dosificacion.jpeg" alt="Tabla Práctica de Dosificación" style="width:100%; height:auto; border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,0.5);">
                    <p style="text-align:center; color:#94a3b8; font-size:0.8rem; margin-top:0.6rem;">Tabla Práctica de Dosificación — Por cada 10,000 L de agua de alberca</p>
                </div>
            </div>

            <!-- Historial -->
            <div class="card" style="margin-top: 1rem;">
                <h3>📋 Historial de Registros</h3>
                <div class="table-container" id="history-container">
                    <p style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando historial...</p>
                </div>
            </div>
        `;
        renderLogHistory();
    }


    window.toggleDosifTable = () => {
        const panel = document.getElementById('dosif-panel');
        const hint  = document.getElementById('dosif-hint');
        const btnIcon = document.getElementById('dosif-btn-icon');
        const btnText = document.getElementById('dosif-btn-text');
        if (!panel) return;

        const isOpen = panel.style.display === 'block';
        if (isOpen) {
            panel.style.display = 'none';
            hint.style.display  = 'flex';
            btnIcon.textContent = '🔍';
            btnText.textContent = 'Ver tabla';
        } else {
            panel.style.display = 'block';
            hint.style.display  = 'none';
            btnIcon.textContent = '✖';
            btnText.textContent = 'Ocultar';
        }
    };

    window.openDosifLightbox = () => {
        const lb = document.getElementById('dosif-lightbox');
        if (lb) {
            lb.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeDosifLightbox = () => {
        const lb = document.getElementById('dosif-lightbox');
        if (lb) {
            lb.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    window.calcDose = () => {
        const vol = parseFloat(document.getElementById('d-vol').value);
        const subSelect = document.getElementById('d-sub');
        const chemKey = subSelect.value;
        const resultBox = document.getElementById('d-result');
        
        const chem = CHEMICALS_DB[chemKey];
        if (!chem) return;

        if (vol > 0) {
            const calculatedDose = (vol / 10000) * chem.factor;
            let displayVal = calculatedDose;
            let displayUnit = chem.baseUnit;

            // Auto conversion for clean dosage display
            if (chem.baseUnit === "g" && chem.finalUnit === "Kg" && calculatedDose >= 1000) {
                displayVal = calculatedDose / 1000;
                displayUnit = "Kg";
            } else if (chem.baseUnit === "ml" && chem.finalUnit === "L" && calculatedDose >= 1000) {
                displayVal = calculatedDose / 1000;
                displayUnit = "L";
            } else if (chem.baseUnit === "Pza") {
                displayVal = Math.ceil(calculatedDose);
            }

            const formattedVal = displayUnit === "Pza" ? displayVal.toString() : displayVal.toFixed(2);
            const finalDose = formattedVal + ' ' + displayUnit;

            document.getElementById('dose-val').innerText = formattedVal;
            document.getElementById('dose-unit').innerText = displayUnit;
            document.getElementById('dose-sub-name').innerText = chem.name;
            resultBox.style.display = 'block';
            
            // Show registration button
            document.getElementById('btn-reg-dose').style.display = 'block';
            
            // Temporary storage for current calculation
            window._lastDose = { val: finalDose, sub: chem.name };
        }
    };

    window.registerDoseInline = () => {
        if (window._lastDose) {
            const doseText = `${window._lastDose.val} de ${window._lastDose.sub}`;
            const dosisInput = document.getElementById('b-dosis');
            if (dosisInput) {
                if (dosisInput.value && !dosisInput.value.includes(doseText)) {
                    dosisInput.value += ', ' + doseText;
                } else {
                    dosisInput.value = doseText;
                }
            }
        }
    };

    window.registerRoutinesInline = () => {
        const checkboxes = document.querySelectorAll('#daily-checklist input[type="checkbox"]:checked');
        const tasks = Array.from(checkboxes).map(cb => cb.value);
        if (tasks.length > 0) {
            const notasInput = document.getElementById('b-notas');
            if (notasInput) {
                const newNotes = tasks.join(', ');
                if (notasInput.value) {
                    notasInput.value += ', ' + newNotes;
                } else {
                    notasInput.value = newNotes;
                }
            }
        } else {
            alert('Seleccione al menos una tarea para registrar.');
        }
    };

    window.saveLogEntry = () => {
        const entry = {
            id: Date.now(),
            fecha: document.getElementById('b-fecha').value,
            cloro: document.getElementById('b-cloro').value,
            ph: document.getElementById('b-ph').value,
            dosis: document.getElementById('b-dosis').value,
            notas: document.getElementById('b-notas').value
        };

        if (!entry.cloro || !entry.ph) {
            alert('Por favor ingrese Cloro y pH para el registro diario.');
            return;
        }

        const logs = getSavedLogs();
        logs.unshift(entry);
        saveLogs(logs);

        // Reset current log data
        currentLogData = { substance: '', dose: '', tasks: [] };
        
        // Rerender
        renderGestion(document.getElementById('gestion'));
        alert('✅ Registro guardado con éxito.');
    };

    window.deleteLog = (id) => {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            const logs = getSavedLogs().filter(l => l.id !== id);
            saveLogs(logs);
            renderLogHistory();
        }
    };

    function renderLogHistory() {
        const container = document.getElementById('history-container');
        const logs = getSavedLogs();

        if (logs.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">No hay registros guardados.</p>`;
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Cloro</th>
                        <th>pH</th>
                        <th>Dosis/Tareas</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => `
                        <tr>
                            <td>${log.fecha}</td>
                            <td><span class="badge ${log.cloro >= 1 && log.cloro <= 5 ? 'badge-primary' : 'badge-danger'}" style="background:#f0f9ff; color:#0369a1;">${log.cloro}</span></td>
                            <td><span class="badge" style="background:#f0fdf4; color:#166534;">${log.ph}</span></td>
                            <td>
                                <div style="font-size:0.8rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                    <strong>${log.dosis || 'N/A'}</strong><br>
                                    <span style="color:var(--text-muted);">${log.notas || ''}</span>
                                </div>
                            </td>
                            <td>
                                <button onclick="deleteLog(${log.id})" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1.1rem;" title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }


    window.updateValve = () => {
        const val = document.getElementById('valve-sel').value;
        const desc = document.getElementById('valve-desc');
        const handle = document.getElementById('valve-handle');
        
        const map = {
            filtrar: { desc: "<strong>Filtrar:</strong> Operación normal. El agua pasa por la arena y regresa limpia.", angle: 0 },
            enjuague: { desc: "<strong>Enjuague:</strong> Reacomoda la arena después del retrolavado. 30 seg.", angle: 60 },
            desague: { desc: "<strong>Desagüe:</strong> Expulsa agua sin pasar por el filtro. Útil para vaciar.", angle: 120 },
            cerrado: { desc: "<strong>Cerrado:</strong> Bloquea el flujo. ⚠️ No encender la bomba.", angle: 180 },
            retrolavado: { desc: "<strong>Retrolavado:</strong> Invierte el flujo para limpiar la arena. 2-3 min.", angle: 240 },
            recircular: { desc: "<strong>Recircular:</strong> Circula agua sin filtrar. Ideal para mezclar químicos.", angle: 300 }
        };
        
        desc.innerHTML = map[val].desc;
        if(handle) {
            handle.style.transform = `translate(-50%, -50%) rotate(${map[val].angle}deg)`;
        }
    };

    // Calculator Functions (Global for simplicity in demo)
    window.calcVol = () => {
        const l = parseFloat(document.getElementById('v-largo').value);
        const a = parseFloat(document.getElementById('v-ancho').value);
        const p = parseFloat(document.getElementById('v-prof').value);
        const resultBox = document.getElementById('v-result');
        
        if (l > 0 && a > 0 && p > 0) {
            const vol = l * a * p;
            document.getElementById('res-val').innerText = vol.toLocaleString();
            document.getElementById('res-liters').innerText = (vol * 1000).toLocaleString() + ' litros';
            resultBox.style.display = 'block';
        } else {
            alert('Por favor ingrese valores válidos');
        }
    };

    // Initialize first render if needed (Home is static in HTML)
});

// Style for form controls added via JS for now
const style = document.createElement('style');
style.textContent = `
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; color: var(--text-muted); }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 1rem; }
    .info-box { padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #edf2f7; }
    .info-box h4 { margin: 8px 0 4px 0; color: var(--primary); font-size: 1rem; }
    .info-box p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    textarea.form-control { font-family: inherit; resize: vertical; }
    .checklist label { display: block; margin-bottom: 8px; cursor: pointer; font-size: 0.95rem; }
    .checklist input { margin-right: 10px; transform: scale(1.2); }

    /* Estilos Válvula Interactiva */
    .valve-interactive-container { display: flex; justify-content: center; margin: 2rem 0; }
    .valve-body {
        position: relative; width: 220px; height: 220px; border-radius: 50%;
        background: #334155; border: 8px solid #1e293b;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    .valve-label {
        position: absolute; font-size: 0.75rem; font-weight: bold; color: #f8fafc;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8); transform: translate(-50%, -50%);
        text-align: center; line-height: 1; z-index: 5;
    }
    .label-filtrar { top: 12%; left: 50%; }
    .label-enjuague { top: 28%; left: 82%; }
    .label-desague { top: 72%; left: 82%; }
    .label-cerrado { top: 88%; left: 50%; }
    .label-retrolavado { top: 72%; left: 18%; }
    .label-recircular { top: 28%; left: 18%; }
    
    .valve-handle {
        position: absolute; top: 50%; left: 50%; width: 20px; height: 160px;
        transform-origin: center; transform: translate(-50%, -50%) rotate(0deg);
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 10;
    }
    .handle-pointer {
        position: absolute; top: -5px; left: 50%; transform: translateX(-50%);
        width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent;
        border-bottom: 25px solid #ef4444; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
    }
    .handle-grip {
        position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
        width: 34px; height: 85px; background: #0f172a; border-radius: 17px;
        box-shadow: 0 6px 10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1);
    }
    .handle-center {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 44px; height: 44px; background: #1e293b; border-radius: 50%;
        box-shadow: inset 0 2px 4px rgba(255,255,255,0.1), 0 2px 5px rgba(0,0,0,0.5); z-index: 15;
    }
`;
document.head.appendChild(style);
