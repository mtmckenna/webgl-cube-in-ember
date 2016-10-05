export default function(){
  this.transition(
    this.use('toDown'),
    this.reverse('toUp')
  );
}
