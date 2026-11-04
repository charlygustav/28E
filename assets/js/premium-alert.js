
        window.showPremiumAlert = function (title, msg, type = 'error') {
            const container = document.getElementById('premium-toast-container');
            if (!container) return;

            const isMobile = window.innerWidth <= 1024 || window.matchMedia('(pointer: coarse)').matches;
            if (isMobile) {
                toast.className = "transform transition-all duration-500 translate-y-6 opacity-0 pointer-events-auto flex items-center gap-3 bg-[#121216]/95 backdrop-blur-md border rounded-full px-3.5 py-2 shadow-xl max-w-[240px]";
            } else {
                toast.className = "transform transition-all duration-500 translate-y-10 opacity-0 pointer-events-auto flex items-center gap-4 bg-[#18181b]/95 backdrop-blur-md border rounded-2xl p-4 shadow-xl w-80";
            }

            let iconClass = '';
            let iconBgClass = '';
            let borderClass = '';
            let shadowClass = '';

            if (type === 'error') {
                borderClass = 'border-red-500/30';
                shadowClass = 'shadow-[0_10px_40px_rgba(239,68,68,0.2)]';
                iconBgClass = 'bg-red-500/20';
                iconClass = 'ph-fill ph-warning-circle text-red-500';
            } else if (type === 'success') {
                borderClass = 'border-emerald-500/30';
                shadowClass = 'shadow-[0_10px_40px_rgba(16,185,129,0.2)]';
                iconBgClass = 'bg-emerald-500/20';
                iconClass = 'ph-fill ph-check-circle text-emerald-500';
            } else {
                borderClass = 'border-brand-500/30';
                shadowClass = 'shadow-[0_10px_40px_rgba(236,72,153,0.2)]';
                iconBgClass = 'bg-brand-500/20';
                iconClass = 'ph-fill ph-info text-brand-500';
            }

            toast.classList.add(borderClass, shadowClass);

            if (isMobile) {
                toast.innerHTML = `
        <div class="w-7 h-7 rounded-full ${iconBgClass} flex items-center justify-center shrink-0">
            <i class="${iconClass} text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="text-white font-bold text-xs truncate leading-tight">${title}</h3>
            <p class="text-zinc-400 text-[10px] leading-tight truncate">${msg}</p>
        </div>
        <button class="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0">
            <i class="ph-bold ph-x text-xs"></i>
        </button>
    `;
            } else {
                toast.innerHTML = `
        <div class="w-10 h-10 rounded-full ${iconBgClass} flex items-center justify-center shrink-0">
            <i class="${iconClass} text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="text-white font-bold text-sm truncate">${title}</h3>
            <p class="text-zinc-400 text-xs mt-0.5 leading-relaxed">${msg}</p>
        </div>
        <button class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0">
            <i class="ph-bold ph-x"></i>
        </button>
    `;
            }

            const closeBtn = toast.querySelector('button');
            let isClosing = false;

            const closeToast = () => {
                if (isClosing) return;
                isClosing = true;
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 500);
            };

            closeBtn.onclick = closeToast;

            // Append to container
            container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.remove('translate-y-10', 'opacity-0');
                    toast.classList.add('translate-y-0', 'opacity-100');
                });
            });

            // Auto dismiss
            setTimeout(() => {
                closeToast();
            }, 4000);
        };

        window.hidePremiumAlert = function () {
            const container = document.getElementById('premium-toast-container');
            if (container && container.lastChild) {
                const btn = container.lastChild.querySelector('button');
                if (btn) btn.click();
            }
        };
    