$(document).ready(function(){
  // moment().format()
  // moment.locale('Chinese')

  var picker = new Pikaday({
    showMonthAfterYear: true,
    minDate: (new Date()),
    field: $('.date-input')[0]
  });

  $('a').click(function(e){
    var href = (this).getAttribute('href');
    if (href === '' || href === 'javascript:;') {
      return false
    }
  });

  $('.video-item').click(function(){
    $('.video-wrap').addClass('active');
    return false
  });

  $('.close-video').click(function(){
    $('.video-wrap').removeClass('active');
    return false
  });

  $('.reserve-btn').click(function(){
    $('.teacher-page-calendar').addClass('active');
    $('.teacher-reservation-info').remove();
    return false
  });

  $('.home-questionnaire .next-step').click(function(){
    $('.step.active').removeClass('active').next().addClass('active');
    return false
  });

  // mobile specific controls
  $('.nav-search-item .search-link').click(function(){
    if($(this).next().width() < 60) {
      $('.nav-search-item').addClass('active')
    }
  });

  $('.nav-search-item .mobile-cancel').click(function(){
    $('.nav-search-item').removeClass('active')
  });

  $('.search-options-switch').click(function(){
    $('.search-sidebar .toolbar').toggle()
  });

  // open modal
  $('.modal-initiator').click(function(){
    $('.modal-wrap').addClass('active')
  });

  // close modal
  $('.modal-wrap').click(function(e){
    if($(e.target).hasClass('modal-wrap')){
      $('.modal-wrap').removeClass('active');
      return false
    }
  });

  $('.modal-action-item').click(function(){
    $('.modal-wrap').removeClass('active')
  });

  // sidebar manipulation

  // open sidebar
  $('.sidebar-initiator').click(function(){
    $('.sidebar-wrap').addClass('active')
  });

  // toggle textbooks dropdown sub menu 
  $('.add-textbooks-wrap .search-dd-results .result-item').mouseenter(function(){
    $('.sub-dropdown-base').addClass('active');
    $('.search-sub-dd').css('top', $(this).position().top + 'px')
  });

  $('.add-textbooks-wrap .search-dd').mouseleave(function(){
    $('.sub-dropdown-base').removeClass('active')
  });
});
