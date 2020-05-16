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
        let text = document.createTextNode(message);
        snackbar.appendChild(text);
        if (actionText) {
            if (!action) {
                action = snackbar.dismiss.bind(snackbar);
            }
            let actionButton = document.createElement('button');
            actionButton.className = 'action';
            actionButton.setAttribute("data-recorder", "true");
            actionButton.innerHTML = actionText;
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
        snackbar.style.bottom = '0px';
        snackbar.style.opacity = 1;
};
