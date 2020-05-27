let previous: any = null;

export function createSnackBar(message: string, actionText: string, action?: any) {

        if (previous) {
            previous.dismiss();
        }
        let snackbar: any = document.createElement('div');
        snackbar.className = 'paper-snackbar';
        snackbar.setAttribute("data-recorder", "true");
        snackbar.dismiss = function() {
            this.style.opacity = 0;
        };
    const successIcon: any = document.createElement("div");
    successIcon.style = "display: flex; align-items: center; justify-content: center";
    successIcon.innerHTML = `
<svg id="successAnimation" data-recorder="true" class="animated" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 70 70">
  <path id="successAnimationResult" data-recorder="true" fill="#D8D8D8" d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z"/>
  <circle id="successAnimationCircle" data-recorder="true" cx="35" cy="35" r="24" stroke="#979797" stroke-width="2" stroke-linecap="round" fill="transparent"/>
  <polyline id="successAnimationCheck" data-recorder="true" stroke="#979797" stroke-width="2" points="23 34 34 43 47 27" fill="transparent"/>
</svg>`;
    successIcon.setAttribute("data-recorder", "true");

    snackbar.appendChild(successIcon);
        let textSpan: any = document.createElement("span");
    textSpan.innerText = message;
    textSpan.setAttribute("data-recorder", "true");
    textSpan.style = "margin-right: auto; margin-left: 18px; font-family: Arial, Helvetica, sans-serif; font-weight: 600; font-size: 14px;";
        snackbar.appendChild(textSpan);
    if (actionText) {
        if (!action) {
            action = snackbar.dismiss.bind(snackbar);
        }
        let actionButton = document.createElement('button');
        actionButton.className = 'action';
        actionButton.innerHTML = actionText;
        actionButton.setAttribute("data-recorder", "true");
        actionButton.addEventListener('click', action);
        snackbar.appendChild(actionButton);
    }
        setTimeout(function() {
            if (previous === this) {
                previous.dismiss();
            }
        }.bind(snackbar), 2000);

        snackbar.addEventListener('transitionend', function(event: TransitionEvent) {
            if (event.propertyName === 'opacity' && this.style.opacity == 0) {
                this.parentElement.removeChild(this);
                if (previous === this) {
                    previous = null;
                }
            }
        }.bind(snackbar));

        previous = snackbar;
        document.body.appendChild(snackbar);
        // In order for the animations to trigger, I have to force the original style to be computed, and then change it.
        getComputedStyle(snackbar).bottom;
        snackbar.style.bottom = '-24px';
        snackbar.style.opacity = 1;
};
