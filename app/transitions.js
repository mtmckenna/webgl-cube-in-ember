export default function(){
  this.transition(
    this.toRoute('controls'),
    this.use('toDown'),
    this.reverse('toUp')
  );
}
