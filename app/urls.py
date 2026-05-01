from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Public pages
    path('', views.index, name='index'),
    path('shop/', views.shop, name='shop'),
    path('shop/filter/', views.shop_filter_ajax, name='shop_filter_ajax'),
    path('product/<slug:product_slug>/', views.product_detail, name='product_detail'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('contact/submit/', views.submit_contact, name='submit_contact'),
    path('contact/submit-ajax/', views.submit_contact_ajax, name='submit_contact_ajax'),
    path('terms/', views.terms, name='terms'),
    
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    
    # Profile
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('profile/add-address/', views.add_address, name='add_address'),
    path('profile/update-address/<int:address_id>/', views.update_address, name='update_address'),
    path('profile/delete-address/<int:address_id>/', views.delete_address, name='delete_address'),
    
    # Cart (AJAX)
    path('cart/', views.cart, name='cart'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/ajax-add/<int:product_id>/', views.ajax_add_to_cart, name='ajax_add_to_cart'),
    path('cart/update/<int:item_id>/', views.update_cart_quantity, name='update_cart_quantity'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    
    # Wishlist (AJAX)
    path('wishlist/', views.wishlist, name='wishlist'),
    path('wishlist/add/<int:product_id>/', views.add_to_wishlist, name='add_to_wishlist'),
    path('wishlist/ajax-add/<int:product_id>/', views.ajax_add_to_wishlist, name='ajax_add_to_wishlist'),
    path('wishlist/remove/<int:product_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
    path('wishlist/move-all-to-cart/', views.move_all_to_cart, name='move_all_to_cart'),
    path('wishlist/clear/', views.clear_wishlist, name='clear_wishlist'),
    
    # Checkout & Orders
    path('checkout/', views.checkout, name='checkout'),
    path('order/<int:order_id>/', views.order_detail, name='order_detail'),
    
    # Reviews (No delete/edit for users - only admin)
    path('review/add/<int:product_id>/', views.add_review, name='add_review'),
    # Review delete is only for admin - no public URL for user delete
    
    # Newsletter
    path('subscribe/', views.subscribe_newsletter, name='subscribe_newsletter'),
]