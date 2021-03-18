import { h, on } from './dom';
import { TinyDatePicker } from './tiny-date-picker';

const win = window;

export function tinyDatePickerFlyout(picker: TinyDatePicker, input: HTMLInputElement) {
  const { root, opts } = picker;
  let offs: Array<() => void> = [];

  const hide = () => {
    offs.forEach((f) => f());
    offs = [];
    root.remove();
  };

  root.append(
    h('.tab-catcher', {
      tabindex: '0',
      onfocus() {
        input.focus();
        hide();
      },
    }),
  );

  on(input, 'focus', () => {
    if (!root.isConnected) {
      root.classList.add('dp-below', 'dp-is-below');
      opts.appendTo.append(root);
      autoPosition(input, picker);
      root.querySelector<HTMLButtonElement>('.dp-current')!.focus();
      offs = [
        on(
          document.body,
          'focus',
          (e: any) => {
            if (e.target !== document.body && e.target !== input && !root.contains(e.target)) {
              console.log('hide', e.target);
              hide();
            }
          },
          true,
        ),
        on(document.body, 'mousedown', (e: any) => {
          if (e.target !== input && !root.contains(e.target)) {
            hide();
          }
        }),
      ];
    }
  });

  on(root, 'selecteddatechange', () => {
    input.value = picker.selectedDate ? opts.format(picker.selectedDate) : '';
  });

  on(root, 'apply', hide);
}

function autoPosition(input: HTMLElement, picker: TinyDatePicker) {
  var inputPos = input.getBoundingClientRect();

  adjustCalY(picker, inputPos);
  adjustCalX(picker, inputPos);

  picker.root.style.visibility = '';
}

function adjustCalX(picker: TinyDatePicker, inputPos: DOMRect) {
  const cal = picker.root;
  const scrollLeft = win.pageXOffset;
  const inputLeft = inputPos.left + scrollLeft;
  const maxRight = win.innerWidth + scrollLeft;
  const offsetWidth = cal.offsetWidth;
  const calRight = inputLeft + offsetWidth;
  const shiftedLeft = maxRight - offsetWidth;
  const left = calRight > maxRight && shiftedLeft > 0 ? shiftedLeft : inputLeft;

  cal.style.left = left + 'px';
}

function adjustCalY(picker: TinyDatePicker, inputPos: DOMRect) {
  const cal = picker.root;
  const scrollTop = win.pageYOffset;
  const inputTop = scrollTop + inputPos.top;
  const calHeight = cal.offsetHeight;
  const belowTop = inputTop + inputPos.height + 8;
  const aboveTop = inputTop - calHeight - 8;
  const isAbove = aboveTop > 0 && belowTop + calHeight > scrollTop + win.innerHeight;
  const top = isAbove ? aboveTop : belowTop;

  if (cal.classList) {
    cal.classList.toggle('dp-is-above', isAbove);
    cal.classList.toggle('dp-is-below', !isAbove);
  }
  cal.style.top = top + 'px';
}
