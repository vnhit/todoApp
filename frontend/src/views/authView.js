export const createAuthHtml = (mode = 'signin') => {
    const isSignIn = mode === 'signin';

    const config={
        title: isSignIn ? 'Sign In' : 'Sign Up',
        subtitle: isSignIn ? 'Welcome back' : 'create an account',
        buttonText: isSignIn ? 'Sign In' : 'Sign Up',
        footerText: isSignIn ? "Don't have an account" : 'Already',
        footerLink: isSignIn ? 'Sign Up' : 'Sign In',
        toggleMode: isSignIn ? 'signup' : 'signin',
    };
    return `
        <div class="fixed inset-0 bg-white z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div class="w-full max-w-[1100px] min-h-[600px] bg-white rounded-[32px] overflow-hidden flex shadow-2xl border border-gray-100">

                <div class="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center">

                    <div class="flex items-center gap-3 mb-10">
                        <div class="w-8 h-8 bg-[#FF5722] rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <i class="ph-bold ph-check text-white text-lg"></i>
                        </div>
                        <span class="font-bold text-xl tracking-tight text-slate-800">DevTasker</span>
                    </div>

                    <h2 class="text-3xl font-bold text-slate-800 mb-2">${config.title}</h2>
                    <p class="text-slate-500 mb-8">${config.subtitle}</p>

                    <form id="auth-form" class="space-y-5">

                        ${!isSignIn ? `
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                            <div class="relative">
                                <i class="ph ph-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                                <input type="text" id="auth-name" placeholder="Enter your name" required maxlength="150" autocomplete="name"
                                    class="w-full bg-slate-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:outline-none focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/10 transition-all">
                            </div>
                        </div>
                        ` : ''}

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <div class="relative">
                                <i class="ph ph-envelope-simple absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                                <input type="email" id="auth-email" placeholder="email@example.com" required maxlength="254" autocomplete="username"
                                    class="w-full bg-slate-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:outline-none focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/10 transition-all">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div class="relative">
                                <i class="ph ph-lock-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                                <input type="password" id="auth-password" placeholder="••••••••" required maxlength="128" autocomplete="${isSignIn ? 'current-password' : 'new-password'}" ${!isSignIn ? 'minlength="8"' : ''}
                                    class="w-full bg-slate-50 border border-gray-100 rounded-xl pl-12 pr-12 py-3.5 focus:bg-white focus:outline-none focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/10 transition-all">
                                <button type="button" data-toggle-password aria-label="Hiện hoặc ẩn mật khẩu" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5722]">
                                    <i class="ph ph-eye text-xl"></i>
                                </button>
                            </div>
                        </div>


                        <button type="submit" class="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] mt-2">
                            ${config.buttonText}
                        </button>
                    </form>

                    <p class="mt-8 text-center text-slate-500 text-sm">
                        ${config.footerText}
                        <a href="#" class="text-[#FF5722] font-bold hover:underline ml-1" data-auth-toggle="${config.toggleMode}">
                            ${config.footerLink}
                        </a>
                    </p>
                </div>

                <div class="hidden lg:flex w-1/2 bg-[#F8F9FB] flex-col items-center justify-center p-12 relative overflow-hidden">
                    <div class="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#FF5722]/5 rounded-full blur-3xl"></div>
                    <div class="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

                    <div class="relative z-10 text-center">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/task-management-4438340-3718484.png"
                            alt="Illustration" class="w-full max-w-[320px] mx-auto drop-shadow-2xl mb-10 mix-blend-multiply">
                        <h3 class="text-2xl font-bold text-slate-800 mb-3">Optimize Your Workflow</h3>
                        <p class="text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                            Quản lý công việc, theo dõi tiến độ và tập trung vào những việc quan trọng.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    `;

}
