/**
 * Абстрактный компонент для DOM контейнера.
 *
 * Умеет:
 *
 * Обрабатывать клики по элементам с 'data-js-action="some-action"', передавая action в метод dispatchActions
 *
 * Переключать состояние верстки, путем отображения содержимого тега <template data-view="view-value"></template>
 * через метод setView('view-value')
 *
 * Отписываться от событий и удалять элемент из верстки через метод destroy()
 * 
 * 
 * Пример использования
 * <div data-js-component="test">
 *   <template>
 * 
 *   </template>
 * </div>  
 */
class DomComponent {
    constructor(DOMContainer) {
        this.container = DOMContainer;
        this.parentCheckForActionsCount = 3;

        /**
         * Делегирование клика на весь контейнер.
         * Чтобы корректно обрабатывать клики по элементам внутри элементов с атрибутом [data-js-action],
         * будем подниматься вверх по родителям на количество не более this.parentCheckForActionsCount
         * @param event
         * @private
         */
        this._clickListener = (event) => {

            let depth = this.parentCheckForActionsCount;
            let target = event.target;

            while (depth > 0 && target) {
                const action = target.getAttribute('data-js-action');

                if (action) {
                    this.dispatchAction(action);
                    break;
                }

                depth--;
                target = target.parentElement;
            }
        };
    }

    init() {
        this.container.addEventListener('click', this._clickListener);
    }

    dispatchAction() {
        throw new Error('dispatchAction method is not implemented');
    }

    /**
     * Установить текст в верстку в элемент с атрибутом data-js-output="${outputName}"
     * @param outputName
     * @param value
     */
    setOutput(outputName, value) {
        const outputs = this.container.querySelectorAll(`[data-js-output="${outputName}"]`);
        Array.prototype.forEach.call(outputs, (output) => output.innerText = value);
    }

    /**
     * Установить view.
     * Берет <template> с атрибутом data-view="${templateName}" и отображает его содержимое
     * @param {string} templateName
     */
    setView(templateName) {
        const template = this.container.querySelector(`template[data-view="${templateName}"]`);

        if (!template) {
            return;
        }

        this.clearView();

        const templateMarkUp = template.content.cloneNode(true);
        this.container.appendChild(templateMarkUp);
    }

    /**
     * Очистить текущее view.
     * Удаляет все элементы, кроме template
     */
    clearView() {
        [].forEach.call(this.container.children, (child) => {
            if (child.tagName.toLowerCase() !== 'template') {
                this.container.removeChild(child);
            }
        });
    }

    destroy() {
        this.container.removeEventListener('click', this._clickListener);
        this._clickListener = null;
        this.container.parentElement.removeChild(this.container);
        this.container = null;
    }
}
