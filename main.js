const imagePreviewWindow = document.getElementById('image-preview-window');
        const previewImage = document.getElementById('preview-image');
        const previewImageName = document.getElementById('preview-image-name');
        const inicioSection = document.getElementById('inicio-section');
        const planificadorSection = document.getElementById('planificador-section');
        const otrosSection = document.getElementById('otros-section');
        const planificadorTitle = document.getElementById('planificador-title'); 
        const navLinkInicio = document.getElementById('nav-link-inicio'); 
        const navLinkCalendario = document.getElementById('nav-link-calendario');
        const navLinkProgramar = document.getElementById('nav-link-programar');
        const navLinkOtros = document.getElementById('nav-link-otros');
        const logoHomeLink = document.getElementById('logo-home-link'); 
        const currentMonthYearDisplay = document.getElementById('current-month-year-display');
        const currentYearDisplaySmall = document.getElementById('current-year-display-small');
        const modeDescription = document.getElementById('mode-description');
        const calendarDaysGrid = document.getElementById('calendar-days-grid');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        const monthSelect = document.getElementById('month-select');
        const calendarYearDisplay = document.getElementById('calendar-year-display');
        const taskModalElement = document.getElementById('task-modal'); 
        const modalContentBox = document.getElementById('modal-content-box'); 
        const modalTitle = document.getElementById('modal-title');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalDateDisplay = document.getElementById('modal-date-display');
        const modalScheduleContent = document.getElementById('modal-schedule-content');
        const taskTimeInput = document.getElementById('task-time');
        const zoneImagesContainer = document.getElementById('zone-images-container'); 
        const selectedZoneImageSrcInput = document.getElementById('selected-zone-image-src');
        const modalViewContent = document.getElementById('modal-view-content');
        const viewTaskTime = document.getElementById('view-task-time');
        const viewTaskZoneImage = document.getElementById('view-task-zone-image');
        const saveTaskBtn = document.getElementById('save-task-btn');
        const cancelModalBtn = document.getElementById('cancel-modal-btn');
        const videoModal = document.getElementById('video-modal');
        const videoModalBg = document.getElementById('video-modal-bg');
        const creditVideo = document.getElementById('credit-video');
        const closeVideoModalBtn = document.getElementById('close-video-modal-btn');
        const wilmerCredit = document.getElementById('wilmer-credit');

        let currentMode = 'view'; 
        let defaultCalendarYear = 2025;
        let defaultCalendarMonth = 5; 

        let displayedYear = defaultCalendarYear;
        let displayedMonth = defaultCalendarMonth; 
        
        let viewModeYear = defaultCalendarYear;
        let viewModeMonth = defaultCalendarMonth;

        const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        let tareasProgramadas = []; 
        let currentlySelectedDate = null;
        let imagePreviewTimeout = null; 

        // Firebase ya está inicializado en el script del módulo
        const tasksRef = dbRef(db, 'tasks');

        function openScheduleModal(dateStr) {
            modalTitle.textContent = `Programar Limpieza para ${dateStr.split('-').reverse().join('/')}`;
            modalDateDisplay.textContent = `Fecha: ${dateStr.split('-').reverse().join('/')}`;
            
            modalScheduleContent.classList.remove('hidden');
            modalViewContent.classList.add('hidden');
            saveTaskBtn.classList.remove('hidden');
            
            taskTimeInput.value = ''; 
            selectedZoneImageSrcInput.value = ''; 
            zoneImagesContainer.innerHTML = ''; 

            for (let i = 1; i <= 7; i++) {
                const imageName = `zona ${i}.jpeg`; 
                const zoneDisplayName = `Zona ${i}`; 

                const imgDiv = document.createElement('div');
                imgDiv.classList.add('zone-image-container', 'cursor-pointer', 'p-1', 'rounded-md', 'hover:bg-white/30');
                const img = document.createElement('img');
                img.src = imageName; 
                img.alt = `Imagen de ${zoneDisplayName}`; 
                img.classList.add('zone-image', 'w-full', 'h-20', 'object-cover', 'rounded'); 
                img.dataset.zoneName = zoneDisplayName; 
                
                img.addEventListener('mouseenter', (event) => showImagePreview(event, imageName, zoneDisplayName));
                img.addEventListener('mouseleave', hideImagePreview);
                img.addEventListener('click', () => selectZoneImage(img));

                imgDiv.appendChild(img);
                zoneImagesContainer.appendChild(imgDiv);
            }
            taskModalElement.classList.remove('hidden');
        }

        function showImagePreview(event, imageUrl, zoneName) {
            clearTimeout(imagePreviewTimeout); 
            previewImage.src = imageUrl;
            previewImageName.textContent = zoneName;

            if (window.innerWidth < 768) { // En móvil, mostrar arriba
                 imagePreviewWindow.style.top = `80px`;
                 imagePreviewWindow.style.right = '50%';
                 imagePreviewWindow.style.transform = 'translateX(50%)';
            } else { // En escritorio, a la derecha
                const zoneGridRect = zoneImagesContainer.getBoundingClientRect();
                const previewHeight = imagePreviewWindow.offsetHeight || 250; 
                let topPosition = zoneGridRect.top + (zoneGridRect.height / 2) - (previewHeight / 2);
                topPosition = Math.max(80, Math.min(topPosition, window.innerHeight - previewHeight - 20)); 
                imagePreviewWindow.style.top = `${topPosition}px`;
                imagePreviewWindow.style.right = `80px`;
                imagePreviewWindow.style.transform = 'none';
            }
            
            imagePreviewWindow.style.display = 'block'; 
            requestAnimationFrame(() => { 
                imagePreviewWindow.classList.add('visible');
            });
        }

        function hideImagePreview() {
            clearTimeout(imagePreviewTimeout); 
            imagePreviewWindow.classList.remove('visible');
            imagePreviewTimeout = setTimeout(() => {
                if (!imagePreviewWindow.classList.contains('visible')) {
                    imagePreviewWindow.style.display = 'none';
                }
            }, 200); 
        }
        
        function showView(viewName) {
            const sections = [inicioSection, planificadorSection, otrosSection];
            let sectionToShow;

            if (viewName === 'planificador') {
                sectionToShow = planificadorSection;
                const newPlannerModeClass = currentMode === 'schedule' ? 'mode-schedule' : 'mode-view';
                planificadorTitle.textContent = currentMode === 'schedule' ? 'Programar Nueva Limpieza' : 'Calendario de Limpieza';
                planificadorSection.classList.remove('mode-view', 'mode-schedule');
                planificadorSection.classList.add(newPlannerModeClass);
                
                if (currentMode === 'schedule') {
                    displayedYear = defaultCalendarYear;
                    displayedMonth = defaultCalendarMonth;
                } else { 
                    displayedYear = viewModeYear;
                    displayedMonth = viewModeMonth;
                }
                renderCalendar();
                updateModeDescription();
            } else if (viewName === 'otros') {
                sectionToShow = otrosSection;
            } else { 
                sectionToShow = inicioSection;
            }

            sections.forEach(section => {
                if (section !== sectionToShow && !section.classList.contains('hidden')) {
                    section.classList.remove('section-visible-state');
                    section.classList.add('section-hidden-state');
                    setTimeout(() => section.classList.add('hidden'), 500);
                }
            });

            if (sectionToShow && sectionToShow.classList.contains('hidden')) {
                sectionToShow.classList.remove('hidden');
                sectionToShow.classList.add('section-hidden-state');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        sectionToShow.classList.remove('section-hidden-state');
                        sectionToShow.classList.add('section-visible-state');
                    });
                });
            }
        }

        function updateModeDescription() {
            if (currentMode === 'schedule') {
                modeDescription.innerHTML = "<h3 class='font-semibold mb-1'>Programar Limpieza:</h3><p>Haz clic en un día del calendario para seleccionar una zona, hora y guardar una nueva tarea de limpieza.</p>";
            } else { 
                modeDescription.innerHTML = "<h3 class='font-semibold mb-1'>Ver Calendario:</h3><p>Los días con limpieza programada se mostrarán resaltados. Haz clic en un día marcado para ver los detalles.</p>";
            }
        }
        
        function renderCalendar() {
            if (currentMode === 'view') {
                viewModeYear = displayedYear;
                viewModeMonth = displayedMonth;
            }

            const monthName = monthNames[displayedMonth];
            const monthNumber = (displayedMonth + 1).toString().padStart(2, '0');
            currentMonthYearDisplay.textContent = `${monthNumber} ${monthName}`;
            currentYearDisplaySmall.textContent = displayedYear;
            calendarYearDisplay.textContent = displayedYear;
            monthSelect.value = displayedMonth;
            calendarDaysGrid.innerHTML = ''; 

            const firstDayOfMonth = new Date(displayedYear, displayedMonth, 1).getDay();
            const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();

            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('calendar-day-cell', 'empty');
                calendarDaysGrid.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                const dateStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dayCell.classList.add('calendar-day-cell');
                dayCell.textContent = day;
                dayCell.dataset.date = dateStr;

                const today = new Date();
                if (displayedYear === today.getFullYear() && displayedMonth === today.getMonth() && day === today.getDate()) {
                    dayCell.classList.add('today');
                }

                if (tareasProgramadas.some(task => task.date === dateStr)) {
                    dayCell.classList.add('scheduled');
                }
                
                dayCell.addEventListener('click', () => handleDayClick(dateStr));
                calendarDaysGrid.appendChild(dayCell);
            }
        }
        
        function handleDayClick(dateStr) {
            currentlySelectedDate = dateStr; 
            modalContentBox.classList.remove('schedule-mode', 'view-mode'); 
            if (currentMode === 'schedule') {
                modalContentBox.classList.add('schedule-mode');
                openScheduleModal(dateStr);
            } else {
                const tasksForDay = tareasProgramadas.filter(task => task.date === dateStr);
                if (tasksForDay.length > 0) {
                    modalContentBox.classList.add('view-mode');
                    openViewTaskModal(tasksForDay[0]); 
                } 
            }
        }

        function populateMonthSelect() {
            monthNames.forEach((name, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = name; 
                monthSelect.appendChild(option);
            });
        }
        
        function selectZoneImage(selectedImg) {
            document.querySelectorAll('.zone-image').forEach(img => img.classList.remove('selected'));
            selectedImg.classList.add('selected');
            selectedZoneImageSrcInput.value = selectedImg.src; 
            console.log("Zona seleccionada:", selectedImg.src, "Nombre:", selectedImg.dataset.zoneName);
        }

        function openViewTaskModal(task) {
            modalTitle.textContent = `Detalle de Limpieza para ${task.date.split('-').reverse().join('/')}`;
            modalDateDisplay.textContent = `Fecha: ${task.date.split('-').reverse().join('/')}`;

            modalScheduleContent.classList.add('hidden');
            modalViewContent.classList.remove('hidden');
            saveTaskBtn.classList.add('hidden');

            viewTaskTime.textContent = task.time;
            viewTaskZoneImage.src = task.zoneImage;
            viewTaskZoneImage.alt = task.zoneName || "Zona programada";

            taskModalElement.classList.remove('hidden');
        }

        function closeModal() {
            taskModalElement.classList.add('hidden');
            hideImagePreview(); 
        }

        saveTaskBtn.addEventListener('click', () => {
            const time = taskTimeInput.value;
            const zoneImage = selectedZoneImageSrcInput.value;
            const selectedImgElement = document.querySelector('.zone-image.selected');
            const zoneName = selectedImgElement ? selectedImgElement.dataset.zoneName : "Zona Desconocida";

            if (!currentlySelectedDate) {
                showCustomAlert("Error: No hay fecha seleccionada.");
                return;
            }
            if (!time) {
                showCustomAlert("Por favor, especifica una hora.");
                return;
            }
            if (!zoneImage) {
                showCustomAlert("Por favor, selecciona una zona de limpieza.");
                return;
            }

            // Guardar en Firebase
            const newTaskRef = tasksRef.push();
            newTaskRef.set({
                date: currentlySelectedDate,
                zoneImage: zoneImage,
                time: time,
                zoneName: zoneName,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
                showCustomAlert("Tarea guardada exitosamente");
                closeModal();
            })
            .catch(error => {
                showCustomAlert("Error al guardar: " + error.message);
            });
        });

        function showCustomAlert(message) {
            const alertBox = document.createElement('div');
            alertBox.style.position = 'fixed';
            alertBox.style.left = '50%';
            alertBox.style.top = '20px';
            alertBox.style.transform = 'translateX(-50%)';
            alertBox.style.padding = '15px 20px';
            alertBox.style.backgroundColor = '#f8d7da'; 
            alertBox.style.color = '#721c24'; 
            alertBox.style.border = '1px solid #f5c6cb';
            alertBox.style.borderRadius = '8px';
            alertBox.style.zIndex = '1000'; 
            alertBox.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            alertBox.textContent = message;
            document.body.appendChild(alertBox);

            setTimeout(() => {
                alertBox.remove();
            }, 3000); 
        }

        closeModalBtn.addEventListener('click', closeModal);
        cancelModalBtn.addEventListener('click', closeModal);
        navLinkInicio.addEventListener('click', (e) => { 
            e.preventDefault();
            showView('inicio');
        });
        navLinkCalendario.addEventListener('click', (e) => {
            e.preventDefault();
            currentMode = 'view';
            showView('planificador');
        });
        navLinkProgramar.addEventListener('click', (e) => {
            e.preventDefault();
            currentMode = 'schedule';
            showView('planificador');
        });
        navLinkOtros.addEventListener('click', (e) => { 
            e.preventDefault();
            showView('otros');
        });
        logoHomeLink.addEventListener('click', (e) => { 
            e.preventDefault();
            showView('inicio');
        });
        prevMonthBtn.addEventListener('click', () => {
            displayedMonth--;
            if (displayedMonth < 0) {
                displayedMonth = 11;
                 if(displayedYear > defaultCalendarYear) {
                    displayedYear--; 
                 } else { 
                    displayedMonth = (displayedYear === defaultCalendarYear && defaultCalendarMonth === 5) ? 5 : 0; 
                 }
            }
            if (displayedYear < defaultCalendarYear) { 
                displayedYear = defaultCalendarYear;
                displayedMonth = defaultCalendarMonth;
            }
            if (displayedYear === defaultCalendarYear && displayedMonth < defaultCalendarMonth && currentMode === 'schedule') {
                 displayedMonth = defaultCalendarMonth;
            }
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            displayedMonth++;
            if (displayedMonth > 11) {
                displayedMonth = 0;
                displayedYear++;
            }
            renderCalendar();
        });

        monthSelect.addEventListener('change', (e) => {
            const selectedNewMonth = parseInt(e.target.value);
            if (displayedYear === defaultCalendarYear && selectedNewMonth < defaultCalendarMonth && currentMode === 'schedule') {
                monthSelect.value = displayedMonth; 
                showCustomAlert(`En modo programar, no se puede ir antes de ${monthNames[defaultCalendarMonth]} de ${defaultCalendarYear}.`);
                return;
            }
            displayedMonth = selectedNewMonth;
            renderCalendar();
        });

        document.addEventListener('DOMContentLoaded', () => {
            populateMonthSelect();
            
            viewModeMonth = defaultCalendarMonth; 
            viewModeYear = defaultCalendarYear; 

            displayedMonth = defaultCalendarMonth; 
            displayedYear = defaultCalendarYear;
            
            monthSelect.value = displayedMonth; 
            calendarYearDisplay.textContent = displayedYear;
            
            inicioSection.classList.remove('hidden', 'section-hidden-state');
            inicioSection.classList.add('section-visible-state');
            planificadorSection.classList.add('hidden', 'section-hidden-state');
            planificadorSection.classList.remove('section-visible-state');
            otrosSection.classList.add('hidden', 'section-hidden-state'); 
            otrosSection.classList.remove('section-visible-state');

            wilmerCredit.addEventListener('click', () => {
                videoModal.classList.remove('hidden');
                creditVideo.currentTime = 0; 
                creditVideo.play();
            });

            closeVideoModalBtn.addEventListener('click', () => {
                creditVideo.pause();
                videoModal.classList.add('hidden');
            });

            videoModalBg.addEventListener('click', () => { 
                creditVideo.pause();
                videoModal.classList.add('hidden');
            });
        });