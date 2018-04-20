(function() {

    //
    //
    //			Algorithms
    //
    //
    let COLOR_WIDTH = 250, // ширина цвета (до какого числа в h доходить рандому)
        algPromise, // переменная для промисов
        runAlgorithm, // имя запущенного алгоритма
        stop, // флаг остановки
        timers = [], // массив таймеров
        drawing = { // объект рисования
            speeds: {},
            counts: {},
            sizes: {},
            multiplier: 1,
            size: 5, // размер шарика
            count: 80, // количество шариков
            draw: function() {
                console.log('Draw');
                let container = document.getElementById('line');
                container.innerHTML = '';
                elements.arr = [];

                h = 0;
                for (let i = 0; i < drawing.count; i++) {
                    let element = document.createElement('div');
                    element.style.left = '0px';
                    element.style.width = drawing.size + 'px';
                    element.style.height = drawing.size + 'px';
                    element.className = 'element';
                    element.id = i;
                    setTimeout(() => {
                        element.style.left = i * drawing.size + 'px';
                    }, 500);
                    let h = randomInteger(0, COLOR_WIDTH);
                    let color = 'hsl(' + h + ',70%,50%)';
                    // element.innerHTML = h;
                    element.style.backgroundColor = color;
                    elements.arr.push({
                        position: i,
                        id: i,
                        h: h
                    })
                    container.appendChild(element);
                    container.style.width = drawing.size * (i + 1) + "px";
                    h++;
                }
            }
        },
        elements = { // объект элементов
            arr: [],
            move: function(toPosition, movingElementPosition) {
                return new Promise((resolve, reject) => {
                    if (stop) return;
                    let movingElement = findFromPosition(movingElementPosition);
                    document.getElementById(movingElement.id).style.left = toPosition * drawing.size + 'px';
                    document.getElementById(movingElement.id).style.top = '30px';
                    setTimeout(() => {
                        movingElement.position = toPosition;
                        document.getElementById(movingElement.id).style.top = '0px';
                        resolve("result");
                    }, 125 * drawing.multiplier);
                })
            },
            moveTree: function(level, shift, movingElementPosition, treePosition = false, parentTop) {
                return new Promise((resolve, reject) => {
                    if (stop) return;
                    let movingElement = findFromPosition(movingElementPosition);
                    if (level) document.getElementById(movingElement.id).style.left = level * ((drawing.size * 6 + (elements.arr.length / 2)) / 3) + 'px';
                    if (shift) document.getElementById(movingElement.id).style.top = shift + 'px';
                    setTimeout(() => {
                        // так как может передаваться ноль, сравниваем строго с false
                        if (treePosition !== false) movingElement.position = 'tree' + treePosition;
                        resolve("result");
                    }, 125 * drawing.multiplier);
                })
            },
            down: function(toPosition, movingElementPosition) {
                return new Promise((resolve, reject) => {
                    if (stop) return;
                    let movingElement = findFromPosition(movingElementPosition);
                    document.getElementById(movingElement.id).style.left = toPosition * drawing.size + 'px';
                    document.getElementById(movingElement.id).style.top = '0px';
                    setTimeout(() => {
                        movingElement.position = toPosition;
                        resolve("result");
                    }, 125 * drawing.multiplier);
                })
            },
            up: function(movingElementPosition, toPosition = false) {
                return new Promise((resolve, reject) => {
                    if (stop) return;
                    let movingElement = findFromPosition(movingElementPosition);
                    document.getElementById(movingElement.id).style.top = '-50px';
                    setTimeout(() => {
                        if ( !! toPosition) movingElement.position = toPosition;
                        resolve("result");
                    }, 125 * drawing.multiplier);
                })
            },
        },
        commands = { // объект комманд
            algorithm: function(algorithm) {
                let summ = 0,
                    median = 0;
                console.log('Start ' + algorithm);
                runAlgorithm = algorithm;
                switchButtons();

                algPromise = Promise.resolve("");

                timers.push({
                    start: new Date(),
                    end: '',
                    dur: ''
                });

                algorithms[algorithm]();

                timers[timers.length - 1].end = new Date();
                for (let j = 0; j < timers.length; j++) {
                    summ += (timers[j].end - timers[j].start);
                }
                median = summ / timers.length;
                timers[timers.length - 1].dur = timers[timers.length - 1].end - timers[timers.length - 1].start;
                console.log(median, timers);

                algPromise = algPromise.then(() => {
                    return end();
                });
                algPromise = algPromise.then(() => {
                    return newStart(algorithm);
                });


            },
            draw: drawing.draw,
            stop: function() {
                timers = [];
                runAlgorithm = '';
                stop = true;
                algPromise = '';
            },
            speed: function(speed) {
                drawing.speeds[speed]();
            },
            count: function(count) {
                drawing.counts[count]();
            },
            size: function(size) {
                drawing.sizes[size]();
            },
            choise: function(command) {
                switch (command) {
                    case 'draw':
                        stop = false;
                        document.getElementById('stop').disabled = true;
                        for (let i = 0; i < algorithms.list.length; i++) {
                            document.getElementById(algorithms.list[i]).disabled = false;
                        }
                        this.draw();
                        break;
                    case 'stop':
                        document.getElementById('draw').disabled = false;
                        document.getElementById('stop').disabled = true;
                        for (let i = 0; i < algorithms.list.length; i++) {
                            document.getElementById(algorithms.list[i]).disabled = true;
                        }
                        this.stop();
                        break;
                }
            }
        },
        algorithms = { // объект алгоритмов
            shell: function(rad = (val) => val) {
                let interval = Math.floor(elements.arr.length / 2)
                while (interval > 0) {
                    for (let i = interval; i < elements.arr.length; i++) {
                        let j = i,
                            movingElement = elements.arr[i];
                        algPromise = algPromise.then(() => {
                            return elements.up(i, 'x');
                        });
                        while (j >= interval && rad(elements.arr[j - interval].h) > rad(movingElement.h)) {
                            let insideJ = j,
                                insideInterval = interval;
                            elements.arr[insideJ] = elements.arr[insideJ - interval];
                            algPromise = algPromise.then(() => {
                                return elements.move(insideJ, insideJ - insideInterval);
                            });
                            j -= interval;
                        }
                        elements.arr[j] = movingElement;
                        algPromise = algPromise.then(() => {
                            return elements.down(j, 'x');
                        });
                    }
                    interval = (interval === 2) ? 1 : Math.floor(interval * 5 / 11)
                }
            },
            comb: function(rad = (val) => val) {
                const factor = 1.247;
                let interval = elements.arr.length / factor;
                while (interval > 1) {
                    let roundInterval = Math.round(interval);
                    for (let i = 0, j = roundInterval; j < elements.arr.length; i++, j++) {
                        if (rad(elements.arr[i].h) > rad(elements.arr[j].h)) {
                            algPromise = algPromise.then(() => {
                                return elements.up(i, 'first');
                            });
                            algPromise = algPromise.then(() => {
                                return elements.up(j, 'second');
                            });
                            algPromise = algPromise.then(() => {
                                return elements.down(i, 'second');
                            });
                            algPromise = algPromise.then(() => {
                                return elements.down(j, 'first');
                            });
                            [elements.arr[i], elements.arr[j]] = [elements.arr[j], elements.arr[i]];
                        }
                    }
                    interval = interval / factor;
                }
            },
            insert: function(rad = (val) => val) {
                for (let i = 1; i < elements.arr.length; i++) {
                    let x = elements.arr[i];
                    algPromise = algPromise.then(() => {
                        return elements.up(i, 'x');
                    });

                    let j = i;
                    while (j > 0 && rad(elements.arr[j - 1].h) > rad(x.h)) {
                        let insideJ = j;

                        elements.arr[insideJ] = elements.arr[insideJ - 1];
                        algPromise = algPromise.then(() => {
                            return elements.move(insideJ, insideJ - 1);
                        });
                        j--;
                    }
                    elements.arr[j] = x;
                    algPromise = algPromise.then(() => {
                        return elements.down(j, 'x');
                    });
                }
            },
            bubble: function() {
                for (let i = 0; i < elements.arr.length; i++) {
                    let f = false;
                    for (let j = 0; j < elements.arr.length - i - 1; j++) {
                        algPromise = algPromise.then(() => {
                            return elements.up(j, 'x');
                        });
                        if (elements.arr[j].h > elements.arr[j + 1].h) {
                            [elements.arr[j + 1], elements.arr[j]] = [elements.arr[j], elements.arr[j + 1]];
                            algPromise = algPromise.then(() => {
                                return elements.move(j, j + 1);
                            });
                            algPromise = algPromise.then(() => {
                                return elements.down(j + 1, 'x');
                            });

                            f = true;
                        } else {
                            algPromise = algPromise.then(() => {
                                return elements.down(j, 'x');
                            });
                        }
                    }
                    if (!f) break;
                }
            },
            shake: function(rad = (val) => val) {
                let left = 0,
                    right = elements.arr.length - 1;
                while (left < right) {
                    let f = false;
                    for (let i = left; i < right; i++) {
                        if (rad(elements.arr[i].h) > rad(elements.arr[i + 1].h)) {
                            algPromise = algPromise.then(() => {
                                return elements.up(i, 'x');
                            });
                            algPromise = algPromise.then(() => {
                                return elements.move(i, i + 1);
                            });
                            algPromise = algPromise.then(() => {
                                return elements.down(i + 1, 'x');
                            });
                            [elements.arr[i], elements.arr[i + 1]] = [elements.arr[i + 1], elements.arr[i]];
                            f = true;
                        } 
                    }
                    right--;
                    for (let i = right; i > left; i--) {
                        if (rad(elements.arr[i].h) < rad(elements.arr[i - 1].h)) {
                            algPromise = algPromise.then(() => {
                                return elements.up(i, 'x');
                            });
                            algPromise = algPromise.then(() => {
                                return elements.move(i, i - 1);
                            });
                            algPromise = algPromise.then(() => {
                                return elements.down(i - 1, 'x');
                            });
                            [elements.arr[i], elements.arr[i - 1]] = [elements.arr[i - 1], elements.arr[i]];
                            f = true;
                        } 
                    }
                    if (!f) break;
                    left++;
                }
            },
            quick: function() {
                quickSort(0, elements.arr.length - 1);
            },
            heap: function() {
                // Строим кучу
                for (let i = elements.arr.length / 2 - 1; i >= 0; i--) {
                    shiftDown(i);
                }

                // Сортируем

                // Для того чтобы корректно изобразить анимацию
                // используется min-куча, чтобы минимальный элемент был
                // слева. Тогда он просто "отсоединяется" от сортируемой части массива,
                // присоединяясь к отсортированным элементам.
                // После него вставляется элемент из конца и следующий цикл просеивания
                // идет уже с этого элемента.
                // Для этого в функцию shiftDown передается коэффициент 
                // равный номеру корневого элемента деленному на 2.
                // Это позволяет строить дерево не с нулевого элемента 
                // в массиве применяя формулу elem * 2 + 1. 
                for (let i = 1; i < elements.arr.length; i++) {

                    algPromise = algPromise.then(() => {
                        return elements.up(elements.arr.length - 1, 'last');
                    });
                    for (let j = elements.arr.length - 2; j >= i; j--) {
                        algPromise = algPromise.then(() => {
                            return elements.move(j + 1, j);
                        });
                    }
                    algPromise = algPromise.then(() => {
                        return elements.down(i, 'last');
                    });

                    elements.arr.splice(i, 0, elements.arr[elements.arr.length - 1]);
                    elements.arr.pop();


                    shiftDown(i, i / 2);
                }
            },
            merge: function() {
                merge(0, elements.arr.length - 1);
            },
            radix: function() {
                this.comb(getRad(2));
                this.comb(getRad(1));
                this.insert(getRad(0));
            },
            tree: function() {
                treeArr = [];
                for (i = 0; i < elements.arr.length; i++) {
                    addNode(elements.arr[i]);
                    // одновременно переносим все в начало
                    // document.getElementById(i).style.left = '0px';
                }
                elements.arr = [];
                walk(0);
            },
            list: []
        };



    //
    //
    //			Model and functions
    //
    //

    // Radix
    //

    function getRad(rad) {
        let insideRad = rad;
        return function(value) {
            return Math.floor(value / Math.pow(10, insideRad));
        };
    }

    // Tree
    //

    function walk(node) {
        if (!treeArr[node]) return;
        walk(treeArr[node].left);
        let insideArrLength = elements.arr.length,
            insidePosition = 'tree' + node;
        algPromise = algPromise.then(() => {
            return elements.move(insideArrLength, insidePosition);
        });
        elements.arr.push(treeArr[node].val);

        walk(treeArr[node].right);
    }

    function addNode(val) {
        add(0, val, 0, 0, 0);
    }

    function add(node, val, shift, level, parentTop) {
        let side,
            sizeTree = drawing.size * 6 + (elements.arr.length / 2),
            position = level ? parentTop + shift * sizeTree / level : 0,
            insideShift = shift,
            insideLength = treeArr.length,
            insideLevel = level,
            insidePosition = position;
        algPromise = algPromise.then(() => {
            return elements.moveTree(insideLevel, insidePosition, val.position, insideLength, parentTop);
        });
        if (!treeArr[node]) {
            treeArr.push({
                val: val,
                left: null,
                right: null
            });
            return treeArr.length - 1;
        }
        level++;

        if (val.h < treeArr[node].val.h) side = 'left', shift = 1;
        else side = 'right', shift = -1;

        treeArr[node][side] = add(treeArr[node][side], val, shift, level, position);

        return node;
    }

    function find(val, node, parent) {
        if (!treeArr[node]) return null;
        if (treeArr[node].val.h === val) return {
            node: node,
            parent: parent
        };
        else if (val < treeArr[node].val.h) return find(val, treeArr[node].left, node);
        else return find(val, treeArr[node].right, node);
    }

    function remove(val) {
        let node = find(val, 0),
            removedNode;
        if (!node) return null;
        if (!treeArr[node.node].left && !treeArr[node.node].right) { // если нет потомков

            // удалить запись у родителя
            removedNode = treeArr[node.node];
            if (treeArr[node.parent].left === node.node) treeArr[node.parent].left = null;
            else treeArr[node.parent].right = null;

            return removedNode;
        } else if (!treeArr[node.node].left) { // если только правый потомок

            // удалять запись у родителя не надо
            removedNode = treeArr[node.node];
            treeArr[node.node] = treeArr[treeArr[node.node].right];
            return removedNode;
        } else if (!treeArr[node.node].right) { // если только левый потомок

            // удалять запись у родителя не надо
            removedNode = treeArr[node.node];
            treeArr[node.node] = treeArr[treeArr[node.node].left];
            return removedNode;
        } else { // если есть оба потомка
            let i = treeArr[node.node].right;
            while (treeArr[i].left) {
                i = treeArr[i].left;
            }
            let newNode = remove(treeArr[i].val.h);

            removedNode = Object.assign({}, treeArr[node.node]);
            treeArr[node.node].val = newNode.val;
            return removedNode;
        }
    }

    // Merge
    //

    function merge(low, high) {
        let middle,
            resultArr = [],
            leftArr = [],
            rightArr = [];
        if (high - low >= 1) {
            middle = low + Math.floor((high - low) / 2);
            leftArr = merge(low, middle);
            rightArr = merge(middle + 1, high);
            let i = low, // low,
                leftStart = low,
                leftEnd = middle,
                rightStart = middle + 1,
                rightEnd = high;
            for (let j = leftStart; j <= leftEnd; j++) {
                algPromise = algPromise.then(() => {
                    return elements.up(j, 'up' + j);
                });
            }
            for (let j = rightStart; j <= rightEnd; j++) {
                algPromise = algPromise.then(() => {
                    return elements.up(j, 'up' + j);
                });
            }

            while (leftArr.length || rightArr.length) {
                let insideI = i;
                if (!rightArr.length || (rightArr.length && leftArr.length && (leftArr[0].h < rightArr[0].h))) {
                    let insideStart = leftStart;
                    resultArr.push(leftArr.shift());

                    algPromise = algPromise.then(() => {
                        return elements.down(insideI, 'up' + insideStart);
                    });
                    leftStart++;
                } else if (!leftArr.length || (rightArr.length && leftArr.length && (leftArr[0].h >= rightArr[0].h))) {
                    let insideStart = rightStart;
                    resultArr.push(rightArr.shift());

                    algPromise = algPromise.then(() => {
                        return elements.down(insideI, 'up' + insideStart);
                    });
                    rightStart++;
                }
                i++;
            }
            return resultArr;
        }
        return elements.arr.slice(low, high + 1);

    }


    // Heap
    //

    function shiftDown(elem, k = 0) {

        // если мы проходим по подмассиву (k не равно нулю), то нужно применять коэффициенты и инкрементировать subElem.
        // чтобы дерево можно было строить не с нулевого элемента, применяя формулу elem * 2 + 1,
        // нужно в качестве elem использовать число, равное номеру текущего элемента в исходном массиве
        // от которого отняли номер коренвого элемента деленный на два.

        let numChild,
            subElem = elem - k,
            numChild1 = k !== 0 ? subElem * 2 + 1 : elem * 2 + 1,
            numChild2 = k !== 0 ? subElem * 2 + 2 : elem * 2 + 2,
            child1 = elements.arr[numChild1],
            child2 = elements.arr[numChild2];

        // если нет детей, то не идти
        // (если нет первого дочернего, то значит нет и второго)

        if (!child1) return;

        // если нет второго ребенка, то берем первого (если он больше конечно)
        // если есть двое 
        // 		если оба меньше, то берем большего из них.
        // 		если только первый меньше, то берем первого
        // 		если только второй меньше, то берем второй
        // если никто не меньше, то выходим

        if (!child2) {
            if (elements.arr[elem].h > child1.h) numChild = numChild1;
            else return;
        } else if (elements.arr[elem].h > child1.h && elements.arr[elem].h > child2.h) {
            numChild = child1.h < child2.h ? numChild1 : numChild2;
        } else if (elements.arr[elem].h > child1.h) {
            numChild = numChild1;
        } else if (elements.arr[elem].h > child2.h) {
            numChild = numChild2;
        } else return;
        let insideElem = elem,
            insideNumChild = numChild;
        algPromise = algPromise.then(() => {
            return elements.up(insideElem, 'elem');
        });
        algPromise = algPromise.then(() => {
            return elements.up(numChild, 'numChild');
        });
        algPromise = algPromise.then(() => {
            return elements.down(numChild, 'elem');
        });
        algPromise = algPromise.then(() => {
            return elements.down(insideElem, 'numChild');
        });

        [elements.arr[elem], elements.arr[numChild]] = [elements.arr[numChild], elements.arr[elem]];

        // если мы проходим по подмассиву (k не равно нулю), то нужно сравнивать дочерний элемент не с концом массива, 
        // а с концом массива + корневой элемент  

        if (numChild * 2 < elements.arr.length + k * 2) shiftDown(numChild, k);
    }



    // Quick
    //
    function quickSort(low, high) {
        if (low < high) {
            let pivot = partitionHoar(low, high);
            quickSort(low, pivot);
            quickSort(pivot + 1, high);
        }
    }

    function partitionHoar(low, high) {
        let pivot = low,
            i = low - 1,
            j = high + 1;
        while (true) {

            do {
                i++;
            } while (elements.arr[i].h < elements.arr[pivot].h)
            do {
                j--;
            } while (elements.arr[j].h > elements.arr[pivot].h)
            if (i >= j) return j;
            [elements.arr[i], elements.arr[j]] = [elements.arr[j], elements.arr[i]];

            let insideI = i,
                insideJ = j;
            algPromise = algPromise.then(() => {
                return elements.up(insideI, 'i');
            });
            algPromise = algPromise.then(() => {
                return elements.up(insideJ, 'j');
            });
            algPromise = algPromise.then(() => {
                return elements.down(insideJ, 'i');
            });
            algPromise = algPromise.then(() => {
                return elements.down(insideI, 'j');
            });
        }
    }

    function getMedianaId(low, high) {
        let summ = 0,
            delta = 1,
            mediana;
        for (let i = low; i < high; i++) {
            summ += elements.arr[i].h;
        }
        mediana = Math.floor(summ / (high - low));
        while (delta < COLOR_WIDTH) {
            for (let i = low; i < high; i++) {
                if (elements.arr[i].h > mediana - delta && elements.arr[i].h < mediana + delta) return i;
            }
            delta++;
        }
        return low;
    }

    function switchButtons() {
        for (let i = 0; i < algorithms.list.length; i++) {
            document.getElementById(algorithms.list[i]).disabled = true;
        }
        document.getElementById('draw').disabled = true;
        document.getElementById('stop').disabled = false;
    }

    function build(controller) {
        for (let i = 0; i < document.getElementsByClassName(controller).length; i++) {
            let id = document.getElementsByClassName(controller)[i].id,
                controllers = drawing[controller + 's'];
            controllers[id] = function() {
                if (controller === 'speed') drawing.multiplier = document.getElementsByClassName(controller)[i].dataset.mult;
                else {
                    if ((runAlgorithm && runAlgorithm !== '') || drawing[controller] === document.getElementsByClassName(controller)[i].dataset.mult) return;
                    drawing[controller] = document.getElementsByClassName(controller)[i].dataset.mult;
                    commands.choise('draw');
                }
                for (controllerName in controllers) {
                    document.getElementById(controllerName).style.opacity = '0.2';
                    document.getElementById(controllerName).style.cursor = 'pointer';
                }
                document.getElementById(id).style.opacity = '0.6';
                document.getElementById(id).style.cursor = 'default';

            };
            document.getElementById(id).addEventListener('click', () => {
                commands[controller](id);
            });
        }
    }

    function buildAlgorithms() {
        for (let i = 0; i < document.getElementsByClassName('algorithm').length; i++) {
            let algorithm = document.getElementsByClassName('algorithm')[i].id;
            algorithms.list.push(algorithm);
            document.getElementById(algorithm).addEventListener('click', () => {
                commands.algorithm(algorithm);
            });
        }

    }


    function findFromPosition(position) {
        for (let i = 0; i < elements.arr.length; i++) {
            if (elements.arr[i].position === position) return elements.arr[i];
        }
    }

    function randomInteger(min, max) {
        var rand = min + Math.random() * (max + 1 - min);
        rand = Math.floor(rand);
        return rand;
    }

    function end() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                for (let i = 0; i < elements.arr.length; i++) {
                    document.getElementById(i).style.left = '0px';
                }
                runAlgorithm = '';
                resolve("result");
            }, 1000)
        })
    }

    function newStart(algorithm) {
        if (stop) return;
        return new Promise((resolve, reject) => {
            drawing.draw();
            setTimeout(() => {
				if (stop) return;
                commands.algorithm(algorithm);
                runAlgorithm = algorithm;
                resolve("result");
            }, 1000)
        })
    }


    //
    //
    //			Controllers
    //
    //

    document.getElementById('stop').addEventListener('click', () => {
        commands.choise('stop')
    });
    document.getElementById('draw').addEventListener('click', () => {
        commands.choise('draw')
    });
    window.addEventListener('load', () => {
        build('speed'); 
        build('size');
        build('count');
        buildAlgorithms();
        commands.speed('single');
        commands.count('ten');
        commands.size('middle');
        commands.choise('draw');
    });


})();