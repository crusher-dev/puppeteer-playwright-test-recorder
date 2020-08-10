import uuid from 'uuid'
import getDomFromPath from '../../utils/domPath';

const frameID = uuid.v4()

document.addEventListener('click', (e: MouseEvent) => {
    if (!e.isTrusted) {
        return true
    }

    const path = getDomFromPath(e.target as Element)

    window.top.postMessage(
        {
            message: EVENTS.CLICK,
            frameId: frameID,
            path,
        },
        '*'
    )

    return true;
})