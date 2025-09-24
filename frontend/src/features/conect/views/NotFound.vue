<template>
  <div>
    <div class="error  mx-auto" data-text="404">404</div>

    <h2 class="text-center">Parece que você está perdido </h2>
    <p class="text-center">Ooooops, essa página não existe mais.</p>
    <button><router-link to="/">Home</router-link></button>


  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style lang="scss" scoped>
$orange: #f49448;

$violet: #4038a0;
$body: #191c21;
$white: #fff;

div {
  margin: 5rem 0;
}

h2,
p {
  color: $white;
  text-align: center;
}

a {
  color: $white;
  text-decoration: none;
}

button {
  font-weight: bold;
  font-size: 15pt;
  margin-top: 20px;
  border-radius: 5px;
  padding: 0.5rem 2rem;
  transition: all 0.3s ease-out;
  background: transparent;
  border-color: $orange;
  color: $white;
  border: 2px solid $orange;
  cursor: pointer;
  margin: 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: $orange;
    color: $white;
  }
}

.error {
  color: $white;
  font-size: 17rem;
  position: relative;
  line-height: 1;
  width: 31.5rem;
  font-weight: 700;
  margin: 0 auto;
  text-align: center;
}

.error:before {
  content: attr(data-text);
  position: absolute;
  left: 0.5rem;
  top: 0;
  overflow: hidden;
  clip: rect(0, 900rem, 0, 0);
  animation: noise-anim-2 3s infinite linear alternate-reverse;
}

.error:after {
  content: attr(data-text);
  position: absolute;
  left: 0.875rem;
  text-shadow: -0.093rem 0 $violet;
  top: 0;
  color: $orange;
  background: $body;
  overflow: hidden;
  clip: rect(0, 900rem, 0, 0);
  animation: noise-anim 2s infinite linear alternate-reverse;
  text-align: center;
}

@-webkit-keyframes noise-anim {
  0% {
    clip: rect(80.563rem, 9990.563rem, 6.25rem, 0);
  }

  5% {
    clip: rect(0.25rem, 9990.563rem, 3.875rem, 0);
  }

  10% {
    clip: rect(40.188rem, 9990.563rem, 1rem, 0);
  }

  15% {
    clip: rect(0.125rem, 9990.563rem, 60.5rem, 0);
  }

  20% {
    clip: rect(10.125rem, 9990.563rem, 0.375rem, 0);
  }

  25% {
    clip: rect(80.563rem, 9990.563rem, 20.313rem, 0);
  }

  30% {
    clip: rect(10.313rem, 9990.563rem, 30.5rem, 0);
  }

  35% {
    clip: rect(3.563rem, 9990.563rem, 6.063rem, 0);
  }

  40% {
    clip: rect(20.25rem, 9990.563rem, 70.125rem, 0);
  }

  45% {
    clip: rect(5.063rem, 9990.563rem, 0.188rem, 0);
  }

  50% {
    clip: rect(90.188rem, 9990.563rem, 20.375rem, 0);
  }

  55% {
    clip: rect(60.5rem, 9990.563rem, 80.313rem, 0);
  }

  60% {
    clip: rect(40.188rem, 9990.563rem, 20.5rem, 0);
  }

  65% {
    clip: rect(40.25rem, 9990.563rem, 0.688rem, 0);
  }

  70% {
    clip: rect(1.063rem, 9990.563rem, 30.188rem, 0);
  }

  75% {
    clip: rect(70.25rem, 9990.563rem, 60.375rem, 0);
  }

  80% {
    clip: rect(6.25rem, 9990.563rem, 0.25rem, 0);
  }

  85% {
    clip: rect(90.125rem, 9990.563rem, 1.938rem, 0);
  }

  90% {
    clip: rect(90.188rem, 9990.563rem, 90.5rem, 0);
  }

  95% {
    clip: rect(20.188rem, 9990.563rem, 4.813rem, 0);
  }

  100% {
    clip: rect(90.125rem, 9990.563rem, 0.5rem, 0);
  }
}

@keyframes noise-anim {
  0% {
    clip: rect(80.563rem, 9990.563rem, 6.25rem, 0);
  }

  5% {
    clip: rect(0.25rem, 9990.563rem, 3.875rem, 0);
  }

  10% {
    clip: rect(40.188rem, 9990.563rem, 1rem, 0);
  }

  15% {
    clip: rect(0.125rem, 9990.563rem, 60.5rem, 0);
  }

  20% {
    clip: rect(10.125rem, 9990.563rem, 0.375rem, 0);
  }

  25% {
    clip: rect(80.563rem, 9990.563rem, 20.313rem, 0);
  }

  30% {
    clip: rect(10.313rem, 9990.563rem, 30.5rem, 0);
  }

  35% {
    clip: rect(3.563rem, 9990.563rem, 6.063rem, 0);
  }

  40% {
    clip: rect(20.25rem, 9990.563rem, 70.125rem, 0);
  }

  45% {
    clip: rect(5.063rem, 9990.563rem, 0.188rem, 0);
  }

  50% {
    clip: rect(90.188rem, 9990.563rem, 20.375rem, 0);
  }

  55% {
    clip: rect(60.5rem, 9990.563rem, 80.313rem, 0);
  }

  60% {
    clip: rect(40.188rem, 9990.563rem, 20.5rem, 0);
  }

  65% {
    clip: rect(40.25rem, 9990.563rem, 0.688rem, 0);
  }

  70% {
    clip: rect(1.063rem, 9990.563rem, 30.188rem, 0);
  }

  75% {
    clip: rect(70.25rem, 9990.563rem, 60.375rem, 0);
  }

  80% {
    clip: rect(6.25rem, 9990.563rem, 0.25rem, 0);
  }

  85% {
    clip: rect(90.125rem, 9990.563rem, 1.938rem, 0);
  }

  90% {
    clip: rect(90.188rem, 9990.563rem, 90.5rem, 0);
  }

  95% {
    clip: rect(20.188rem, 9990.563rem, 4.813rem, 0);
  }

  100% {
    clip: rect(90.125rem, 9990.563rem, 0.5rem, 0);
  }
}
</style>