/**
 * Project Velocity — Mobile Touch Controls
 * Uses the existing player movement and camera APIs.
 */
export function installMobileControls(player, canvas) {
  const isTouchDevice = window.matchMedia(
    '(pointer: coarse)'
  ).matches;

  if (!isTouchDevice) return;

  const style = document.createElement('style');

  style.textContent = `
    #velocity-mobile-controls {
      position: fixed;
      inset: 0;
      z-index: 8000;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }

    #velocity-mobile-joystick {
      position: absolute;
      left: max(20px, env(safe-area-inset-left));
      bottom: max(30px, env(safe-area-inset-bottom));
      width: 118px;
      height: 118px;
      border-radius: 50%;
      border: 2px solid rgba(100, 220, 255, .55);
      background: rgba(8, 25, 45, .6);
      backdrop-filter: blur(8px);
      pointer-events: auto;
      touch-action: none;
    }

    #velocity-mobile-stick {
      position: absolute;
      width: 48px;
      height: 48px;
      top: 35px;
      left: 35px;
      border-radius: 50%;
      background: #68dcff;
      box-shadow: 0 0 18px #36bfff88;
      pointer-events: none;
    }

    #velocity-mobile-look {
      position: absolute;
      right: 0;
      top: 22%;
      width: 48%;
      height: 52%;
      pointer-events: auto;
      touch-action: none;
    }

    #velocity-mobile-run {
      position: absolute;
      right: max(24px, env(safe-area-inset-right));
      bottom: max(35px, env(safe-area-inset-bottom));
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 1px solid #69dcff;
      background: rgba(8, 25, 45, .8);
      color: white;
      font: 700 13px Arial, sans-serif;
      pointer-events: auto;
      touch-action: none;
    }

    @media (max-height: 500px) {
      #velocity-mobile-joystick {
        width: 90px;
        height: 90px;
        bottom: 15px;
      }

      #velocity-mobile-stick {
        width: 40px;
        height: 40px;
        left: 25px;
        top: 25px;
      }

      #velocity-mobile-run {
        width: 60px;
        height: 60px;
        bottom: 15px;
      }
    }
  `;

  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'velocity-mobile-controls';

  root.innerHTML = `
    <div id="velocity-mobile-joystick">
      <div id="velocity-mobile-stick"></div>
    </div>
    <div id="velocity-mobile-look"></div>
    <button id="velocity-mobile-run" type="button">
      RUN
    </button>
  `;

  document.body.appendChild(root);

  // VELOCITY_MOBILE_RUN_POSITION_V2
  // Keep RUN above the bottom-right Cheat Codes control.
  const runPositionStyle = document.createElement("style");
  runPositionStyle.textContent = `
    @media (pointer: coarse) {
      #velocity-mobile-run {
        bottom: max(105px, calc(env(safe-area-inset-bottom) + 90px)) !important;
        right: max(24px, env(safe-area-inset-right)) !important;
      }
    }
  `;
  document.head.appendChild(runPositionStyle);

  const joystick = root.querySelector(
    '#velocity-mobile-joystick'
  );

  const stick = root.querySelector(
    '#velocity-mobile-stick'
  );

  const look = root.querySelector(
    '#velocity-mobile-look'
  );

  const run = root.querySelector(
    '#velocity-mobile-run'
  );

  let moveX = 0;
  let moveY = 0;
  let running = false;
  let joystickPointer = null;
  let lookPointer = null;
  let lastLookX = 0;
  let lastLookY = 0;

  function syncMovement() {
    player.setMobileMovement(moveX, moveY, running);

    // VELOCITY_MOBILE_ROOFTOP_MOVEMENT_V1
    // Share joystick input with the separate crystal rooftop controller.
    window.velocityMobileRooftopInput = {
      x: moveX,
      y: moveY,
      sprint: running
    };
  }

  function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width * .32;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > radius) {
      dx = dx / distance * radius;
      dy = dy / distance * radius;
    }

    moveX = dx / radius;
    moveY = -dy / radius;

    stick.style.transform =
      `translate(${dx}px, ${dy}px)`;

    syncMovement();
  }

  joystick.addEventListener('pointerdown', event => {
    if (joystickPointer !== null) return;

    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  });

  joystick.addEventListener('pointermove', event => {
    if (event.pointerId !== joystickPointer) return;
    updateJoystick(event);
  });

  function releaseJoystick(event) {
    if (event.pointerId !== joystickPointer) return;

    joystickPointer = null;
    moveX = 0;
    moveY = 0;
    stick.style.transform = '';
    syncMovement();
  }

  joystick.addEventListener('pointerup', releaseJoystick);
  joystick.addEventListener('pointercancel', releaseJoystick);

  look.addEventListener('pointerdown', event => {
    if (lookPointer !== null) return;

    lookPointer = event.pointerId;
    lastLookX = event.clientX;
    lastLookY = event.clientY;
    look.setPointerCapture(event.pointerId);
  });

  look.addEventListener('pointermove', event => {
    if (event.pointerId !== lookPointer) return;

    const dx = event.clientX - lastLookX;
    const dy = event.clientY - lastLookY;

    player.rotateMobileCamera(dx, dy);

    lastLookX = event.clientX;
    lastLookY = event.clientY;
  });

  function releaseLook(event) {
    if (event.pointerId === lookPointer) {
      lookPointer = null;
    }
  }

  look.addEventListener('pointerup', releaseLook);
  look.addEventListener('pointercancel', releaseLook);

  // Tap RUN to toggle sprint on or off.
  run.setAttribute('aria-pressed', 'false');

  function updateRunButton() {
    run.textContent = running ? 'RUN ON' : 'RUN';
    run.setAttribute('aria-pressed', String(running));
    run.style.background = running
      ? 'rgba(18, 125, 150, .95)'
      : 'rgba(8, 25, 45, .8)';
    run.style.boxShadow = running
      ? '0 0 18px rgba(54, 191, 255, .55)'
      : 'none';
    syncMovement();
  }

  run.addEventListener('click', event => {
    event.preventDefault();
    running = !running;
    updateRunButton();
  });

  window.addEventListener('blur', () => {
    moveX = 0;
    moveY = 0;
    running = false;
    updateRunButton();
    joystickPointer = null;
    lookPointer = null;
    stick.style.transform = '';
    syncMovement();
  });

  return root;
}
