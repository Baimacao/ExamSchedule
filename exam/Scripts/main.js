document.addEventListener("DOMContentLoaded", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    if (!fullscreenBtn) return; // 保守处理，避免 null 引发异常

    fullscreenBtn.addEventListener("click", () => {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        } catch (e) {
            if (typeof errorSystem !== 'undefined') errorSystem.show('全屏切换失败: ' + e.message);
            else console.error('全屏切换失败: ', e);
        }
    });
});
