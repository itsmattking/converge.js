(function(window) {

  var converge = window.converge;

  function randomWhole(num) {
    return Math.round(Math.random()*num);
  }

  function randomColor() {
    var colors = ['aqua', 'orchid', 'crimson'];
    return colors[Math.ceil(Math.random()*colors.length-1)];
  }

  function generateRandomEntities(num, axis) {
    var elements = [];
    for (var i = 0; i < num; i++) {
      var c = document.createElement('div');
      c.classList.add('entity');
      c.classList.add(randomColor());
      c.style.width = c.style.height = (randomWhole(200) + 10) + 'px';
      c.style.left = randomWhole(window.innerWidth) + 'px';
      c.style.top = '50%';
      c.style.marginTop = (-(parseInt(c.style.width, 10)/2)) + 'px';
      elements.push(c);
    }
    return elements;
  }

  function generateWave() {
    var elements = generateRandomEntities(randomWhole(20)+10);
    var parent = document.body;
    for (var i = 0; i < elements.length; i++) {
      parent.appendChild(elements[i]);
    }
    var clas = ['bye', 'seeya', 'splode'];
    var num = Math.ceil(Math.random()*clas.length-1);
    var cls = clas[num];
    converge.on(elements).alter('open').stagger(50).thenOn(elements).alter(cls).stagger(50, 3000).then(function() {
      while (elements.length) {
        parent.removeChild(elements.shift());
      }
    }).then(generateWave).run();
  }

  generateWave();

}(window));
