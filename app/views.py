from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Sum, Avg
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from decimal import Decimal
import uuid

from .models import (
    Product, Category, CartItem, WishlistItem, Order, OrderItem, 
    Address, Review, ContactMessage, NewsletterSubscriber, CompanyInfo,
    SocialLink, FAQ, TermsContent, TeamMember, AboutContent, User, ProductVariant
)
from .forms import (
    UserRegisterForm, UserProfileForm, ReviewForm, ContactForm, 
    NewsletterForm, AddressForm, PasswordChangeForm
)


def get_cart_count(user):
    if user.is_authenticated:
        return CartItem.objects.filter(user=user).aggregate(total=Sum('quantity'))['total'] or 0
    return 0


def get_wishlist_count(user):
    if user.is_authenticated:
        return WishlistItem.objects.filter(user=user).count()
    return 0


def index(request):
    best_sellers = Product.objects.filter(is_best_seller=True, stock=True)[:8]
    testimonials = Review.objects.filter(is_verified=True)[:6]
    categories = Category.objects.filter(is_active=True)
    
    context = {
        'best_sellers': best_sellers,
        'testimonials': testimonials,
        'categories': categories,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'index.html', context)


def shop(request):
    products = Product.objects.filter(stock=True)
    categories = Category.objects.filter(is_active=True)
    
    search_query = request.GET.get('q', '')
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) |
            Q(short_description__icontains=search_query) |
            Q(category__name__icontains=search_query)
        )
    
    current_category = request.GET.get('category', '')
    if current_category and current_category != 'all':
        products = products.filter(category__slug=current_category)
    
    current_sort = request.GET.get('sort', 'popular')
    if current_sort == 'price_low':
        products = products.order_by('base_price')
    elif current_sort == 'price_high':
        products = products.order_by('-base_price')
    elif current_sort == 'newest':
        products = products.order_by('-created_at')
    else:
        products = products.order_by('-is_best_seller', '-average_rating')
    
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    wishlist_ids = []
    if request.user.is_authenticated:
        wishlist_ids = list(WishlistItem.objects.filter(user=request.user).values_list('product_id', flat=True))
    
    context = {
        'products': page_obj,
        'categories': categories,
        'current_category': current_category,
        'current_sort': current_sort,
        'search_query': search_query,
        'wishlist_ids': wishlist_ids,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'shop.html', context)


def shop_filter_ajax(request):
    products = Product.objects.filter(stock=True)
    
    search_query = request.GET.get('q', '')
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) |
            Q(short_description__icontains=search_query) |
            Q(category__name__icontains=search_query)
        )
    
    current_category = request.GET.get('category', '')
    if current_category and current_category != 'all':
        products = products.filter(category__slug=current_category)
    
    current_sort = request.GET.get('sort', 'popular')
    if current_sort == 'price_low':
        products = products.order_by('base_price')
    elif current_sort == 'price_high':
        products = products.order_by('-base_price')
    elif current_sort == 'newest':
        products = products.order_by('-created_at')
    else:
        products = products.order_by('-is_best_seller', '-average_rating')
    
    paginator = Paginator(products, 12)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    wishlist_ids = []
    if request.user.is_authenticated:
        wishlist_ids = list(WishlistItem.objects.filter(user=request.user).values_list('product_id', flat=True))
    
    html = render_to_string('includes/products_grid.html', {
        'products': page_obj,
        'user': request.user,
        'wishlist_ids': wishlist_ids,
    }, request=request)
    
    return JsonResponse({
        'status': 'success',
        'html': html,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
        'current_page': page_obj.number,
        'total_pages': page_obj.paginator.num_pages,
        'total_products': page_obj.paginator.count,
        'wishlist_ids': wishlist_ids,
    })


def product_detail(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug, stock=True)
    variants = product.variants.all()
    
    context = {
        'product': product,
        'variants': variants,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'product.html', context)


def about(request):
    about_content = AboutContent.objects.first()
    team_members = TeamMember.objects.filter(is_active=True)
    faqs = FAQ.objects.filter(is_active=True)
    
    stats = {
        'happy_customers': '10,000+',
        'cities_served': '50+',
        'natural_products': '100%',
        'average_rating': '4.8 ★',
    }
    
    quality_steps = [
        {'title': 'Sourcing', 'description': 'We source premium quality makhana directly from trusted farms in Bihar.'},
        {'title': 'Cleaning & Sorting', 'description': 'Each seed is carefully cleaned and sorted for uniformity.'},
        {'title': 'Roasting', 'description': 'Traditional slow-roasting process for that perfect crunch without oil.'},
        {'title': 'Quality Check', 'description': 'Multiple quality checks to ensure taste and freshness in every batch.'},
    ]
    
    context = {
        'about_content': about_content,
        'team_members': team_members,
        'faqs': faqs,
        'stats': stats,
        'quality_steps': quality_steps,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'about.html', context)


def contact(request):
    company_info = CompanyInfo.objects.first()
    social_links = SocialLink.objects.filter(is_active=True)
    
    context = {
        'form': ContactForm(),
        'contact_info': company_info,
        'social_links': {link.platform: link.url for link in social_links},
        'google_map_embed_url': company_info.google_map_embed_url if company_info else '',
        'contact_content': {'hero_text': 'We are always happy to hear from you.'},
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'contact.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def submit_contact_ajax(request):
    form = ContactForm(request.POST)
    
    if form.is_valid():
        form.save()
        return JsonResponse({
            'status': 'success',
            'message': 'Thank you for your message! We will get back to you soon.'
        })
    else:
        errors = {}
        for field, error_list in form.errors.items():
            errors[field] = error_list[0]
        return JsonResponse({
            'status': 'error',
            'message': 'Please correct the errors below.',
            'errors': errors
        }, status=400)


def submit_contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thank you for your message! We will get back to you soon.')
            return redirect('contact')
        else:
            messages.error(request, 'Please correct the errors below.')
            company_info = CompanyInfo.objects.first()
            social_links = SocialLink.objects.filter(is_active=True)
            context = {
                'form': form,
                'contact_info': company_info,
                'social_links': {link.platform: link.url for link in social_links},
                'google_map_embed_url': company_info.google_map_embed_url if company_info else '',
                'contact_content': {'hero_text': 'We are always happy to hear from you.'},
                'cart_count': get_cart_count(request.user),
                'wishlist_count': get_wishlist_count(request.user),
            }
            return render(request, 'contact.html', context)
    return redirect('contact')


@login_required
def profile(request):
    addresses = Address.objects.filter(user=request.user)
    orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
    
    user_profile = {
        'full_name': f"{request.user.first_name} {request.user.last_name}".strip(),
        'email': request.user.email,
        'phone': request.user.phone if hasattr(request.user, 'phone') else '',
        'dob': request.user.dob if hasattr(request.user, 'dob') else None,
        'gender': request.user.gender if hasattr(request.user, 'gender') else None,
        'avatar': request.user.avatar if hasattr(request.user, 'avatar') else None,
    }
    
    context = {
        'user_profile': user_profile,
        'addresses': addresses,
        'orders': orders,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'profile.html', context)


@login_required
def update_profile(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    return redirect('profile')


@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.POST)
        if form.is_valid():
            if request.user.check_password(form.cleaned_data['current_password']):
                request.user.set_password(form.cleaned_data['new_password'])
                request.user.save()
                update_session_auth_hash(request, request.user)
                messages.success(request, 'Password changed successfully!')
            else:
                messages.error(request, 'Current password is incorrect.')
        else:
            for error in form.non_field_errors():
                messages.error(request, error)
            for field, errors in form.errors.items():
                if field != '__all__':
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
    return redirect('profile')


@login_required
def add_address(request):
    if request.method == 'POST':
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            address.save()
            messages.success(request, 'Address added successfully!')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    return redirect('profile')


@login_required
def update_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    if request.method == 'POST':
        form = AddressForm(request.POST, instance=address)
        if form.is_valid():
            form.save()
            messages.success(request, 'Address updated successfully!')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    
    return redirect('profile')


@login_required
def delete_address(request, address_id):
    address = get_object_or_404(Address, id=address_id, user=request.user)
    
    if request.method == 'POST':
        address.delete()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success', 'message': 'Address deleted successfully!'})
        messages.success(request, 'Address deleted successfully!')
    else:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
    
    return redirect('profile')


@login_required
def cart(request):
    cart_items = CartItem.objects.filter(user=request.user).select_related('product', 'variant')
    subtotal = sum(item.total_price for item in cart_items)
    shipping_fee = 0 if subtotal >= 499 else 40
    gst_amount = int(subtotal * Decimal('0.05'))
    total_amount = subtotal + shipping_fee + gst_amount
    
    context = {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_fee': shipping_fee,
        'gst_amount': gst_amount,
        'total_amount': total_amount,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'cart.html', context)


@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id, stock=True)
    quantity = int(request.POST.get('quantity', 1))
    variant_id = request.POST.get('variant_id')
    
    variant = None
    if variant_id and variant_id != '':
        try:
            variant = get_object_or_404(ProductVariant, id=variant_id, product=product)
        except:
            variant = None
    
    cart_item, created = CartItem.objects.get_or_create(
        user=request.user,
        product=product,
        variant=variant,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    messages.success(request, f'{product.name} added to cart!')
    return redirect(request.META.get('HTTP_REFERER', 'shop'))


def ajax_add_to_cart(request, product_id):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Please login to add to cart'}, status=401)
    
    product = get_object_or_404(Product, id=product_id, stock=True)
    quantity = int(request.POST.get('quantity', 1))
    variant_id = request.POST.get('variant_id')
    
    variant = None
    if variant_id and variant_id != '':
        try:
            variant = get_object_or_404(ProductVariant, id=variant_id, product=product)
        except:
            variant = None
    
    cart_item, created = CartItem.objects.get_or_create(
        user=request.user,
        product=product,
        variant=variant,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    cart_count = CartItem.objects.filter(user=request.user).aggregate(total=Sum('quantity'))['total'] or 0
    
    return JsonResponse({
        'status': 'success',
        'message': f'{product.name} added to cart!',
        'cart_count': cart_count
    })


@login_required
def update_cart_quantity(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity > 0:
        cart_item.quantity = quantity
        cart_item.save()
    else:
        cart_item.delete()
    
    return redirect('cart')


@login_required
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    cart_item.delete()
    messages.success(request, 'Item removed from cart.')
    return redirect('cart')


@login_required
def wishlist(request):
    wishlist_items = WishlistItem.objects.filter(user=request.user).select_related('product')
    
    context = {
        'wishlist_items': wishlist_items,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'wishlist.html', context)


@login_required
def add_to_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    WishlistItem.objects.get_or_create(user=request.user, product=product)
    messages.success(request, f'{product.name} added to wishlist!')
    return redirect(request.META.get('HTTP_REFERER', 'shop'))


def ajax_add_to_wishlist(request, product_id):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Please login to add to wishlist'}, status=401)
    
    product = get_object_or_404(Product, id=product_id)
    wishlist_item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
    
    if created:
        message = f'{product.name} added to wishlist!'
        status = 'added'
    else:
        wishlist_item.delete()
        message = f'{product.name} removed from wishlist!'
        status = 'removed'
    
    wishlist_count = WishlistItem.objects.filter(user=request.user).count()
    
    return JsonResponse({
        'status': 'success',
        'message': message,
        'wishlist_status': status,
        'wishlist_count': wishlist_count
    })


@login_required
def remove_from_wishlist(request, product_id):
    WishlistItem.objects.filter(user=request.user, product_id=product_id).delete()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'status': 'success', 'message': 'Removed from wishlist.'})
    
    messages.success(request, 'Removed from wishlist.')
    return redirect('wishlist')


@login_required
def move_all_to_cart(request):
    wishlist_items = WishlistItem.objects.filter(user=request.user)
    for item in wishlist_items:
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=item.product,
            defaults={'quantity': 1}
        )
        if not created:
            cart_item.quantity += 1
            cart_item.save()
    wishlist_items.delete()
    messages.success(request, 'All items moved to cart!')
    return redirect('cart')


@login_required
def clear_wishlist(request):
    WishlistItem.objects.filter(user=request.user).delete()
    messages.success(request, 'Wishlist cleared!')
    return redirect('wishlist')


@login_required
def checkout(request):
    cart_items = CartItem.objects.filter(user=request.user)
    
    if not cart_items:
        messages.error(request, 'Your cart is empty!')
        return redirect('shop')
    
    if request.method == 'POST':
        payment_method = request.POST.get('payment_method', 'cod')
        address_id = request.POST.get('address_id')
        
        if not address_id:
            messages.error(request, 'Please select a shipping address.')
            return redirect('checkout')
        
        address = get_object_or_404(Address, id=address_id, user=request.user)
        
        subtotal = sum(item.total_price for item in cart_items)
        shipping_fee = 0 if subtotal >= 499 else 40
        gst_amount = int(subtotal * Decimal('0.05'))
        total_amount = subtotal + shipping_fee + gst_amount
        
        order_id = f"HM-{uuid.uuid4().hex[:8].upper()}"
        
        order = Order.objects.create(
            order_id=order_id,
            user=request.user,
            address=address,
            total_amount=total_amount,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            gst_amount=gst_amount,
            payment_method=payment_method,
            status='Pending'
        )
        
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                price=item.total_price / item.quantity
            )
        
        cart_items.delete()
        
        messages.success(request, f'Order #{order_id} placed successfully!')
        return redirect('order_detail', order_id=order.id)
    
    addresses = Address.objects.filter(user=request.user)
    if not addresses:
        messages.warning(request, 'Please add a shipping address before checkout.')
        return redirect('profile')
    
    cart_items = CartItem.objects.filter(user=request.user)
    subtotal = sum(item.total_price for item in cart_items)
    shipping_fee = 0 if subtotal >= 499 else 40
    gst_amount = int(subtotal * Decimal('0.05'))
    total_amount = subtotal + shipping_fee + gst_amount
    
    context = {
        'cart_items': cart_items,
        'addresses': addresses,
        'subtotal': subtotal,
        'shipping_fee': shipping_fee,
        'gst_amount': gst_amount,
        'total_amount': total_amount,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'checkout.html', context)


@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    context = {
        'order': order,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'order_detail.html', context)


@login_required
def add_review(request, product_id):
    """Add a review - users CANNOT delete or edit reviews"""
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.product_id = product_id
            if request.user.is_authenticated:
                review.user = request.user
                review.customer_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
            review.is_verified = True
            review.save()
            
            product = review.product
            avg_rating = Review.objects.filter(product=product, is_verified=True).aggregate(Avg('rating'))['rating__avg']
            product.average_rating = avg_rating or 4.5
            product.review_count = Review.objects.filter(product=product, is_verified=True).count()
            product.save()
            
            messages.success(request, 'Thank you for your review!')
        else:
            messages.error(request, 'Please correct the errors below.')
    return redirect('product_detail', product_slug=get_object_or_404(Product, id=product_id).slug)


def register(request):
    if request.user.is_authenticated:
        return redirect('index')
    
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome {user.first_name or user.username}! Your account has been created.')
            return redirect('index')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{error}')
    else:
        form = UserRegisterForm()
    
    context = {
        'form': form,
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'login.html', context)


def user_login(request):
    if request.user.is_authenticated:
        return redirect('index')
    
    if request.method == 'POST':
        username_or_email = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember')
        
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                username = user_obj.username
            except User.DoesNotExist:
                username = username_or_email
        else:
            username = username_or_email
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            if not remember_me:
                request.session.set_expiry(0)
            else:
                request.session.set_expiry(1209600)
            
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')
            next_url = request.GET.get('next', 'index')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username/email or password.')
    
    context = {
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'login.html', context)


def user_logout(request):
    logout(request)
    messages.success(request, 'You have been logged out.')
    return redirect('index')


def subscribe_newsletter(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        if email:
            subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
            if created:
                messages.success(request, 'Successfully subscribed to newsletter!')
            else:
                messages.info(request, 'You are already subscribed.')
        else:
            messages.error(request, 'Please enter a valid email address.')
    return redirect(request.META.get('HTTP_REFERER', 'index'))


def terms(request):
    terms_content = TermsContent.objects.first()
    context = {
        'terms_content': {
            'last_updated': terms_content.last_updated if terms_content else None,
            'order_policy': terms_content.order_policy if terms_content else '',
            'shipping_policy': terms_content.shipping_policy if terms_content else '',
            'returns_policy': terms_content.returns_policy if terms_content else '',
            'privacy_policy': terms_content.privacy_policy if terms_content else '',
            'payment_security': terms_content.payment_security if terms_content else '',
            'product_info': terms_content.product_info if terms_content else '',
            'account_responsibility': terms_content.account_responsibility if terms_content else '',
            'changes_terms': terms_content.changes_terms if terms_content else '',
        },
        'cart_count': get_cart_count(request.user),
        'wishlist_count': get_wishlist_count(request.user),
    }
    return render(request, 'terms.html', context)