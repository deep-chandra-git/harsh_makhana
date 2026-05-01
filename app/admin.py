from django.contrib import admin
from .models import *

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active']
    search_fields = ['username', 'email']
    list_filter = ['is_active', 'is_staff']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['is_active']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'slug', 'base_price', 'discount_percentage', 'stock', 'is_new', 'is_best_seller']
    list_filter = ['category', 'stock', 'is_new', 'is_best_seller']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name', 'category')}
    list_editable = ['base_price', 'discount_percentage', 'stock']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'category', 'short_description', 'long_description', 'image', 'stock')
        }),
        ('Pricing', {
            'fields': ('base_price', 'discount_percentage')
        }),
        ('Product Status', {
            'fields': ('is_new', 'is_best_seller')
        }),
        ('Nutrition Facts (per 100g)', {
            'fields': ('calories', 'protein', 'carbohydrates', 'fiber', 'fat', 'iron'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'weight', 'price', 'compare_price']
    list_filter = ['product']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'user', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order_id', 'user__username']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'customer_name', 'rating', 'is_verified', 'created_at']
    list_filter = ['rating', 'is_verified', 'product']
    search_fields = ['customer_name', 'comment']
    actions = ['mark_as_verified', 'delete_selected_reviews']
    
    def mark_as_verified(self, request, queryset):
        queryset.update(is_verified=True)
    mark_as_verified.short_description = "Mark selected reviews as verified"
    
    def delete_selected_reviews(self, request, queryset):
        for review in queryset:
            product = review.product
            review.delete()
            avg_rating = Review.objects.filter(product=product, is_verified=True).aggregate(models.Avg('rating'))['rating__avg']
            product.average_rating = avg_rating or 4.5
            product.review_count = Review.objects.filter(product=product, is_verified=True).count()
            product.save()
        self.message_user(request, f"{queryset.count()} reviews deleted successfully.")
    delete_selected_reviews.short_description = "Delete selected reviews and update product ratings"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['full_name', 'email', 'subject']
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected messages as read"


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ['email', 'subscribed_at', 'is_active']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email']


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']


@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not CompanyInfo.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(TermsContent)
class TermsContentAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not TermsContent.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(AboutContent)
class AboutContentAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('hero_text', 'mission', 'vision')
        }),
    )
    
    def has_add_permission(self, request):
        return not AboutContent.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'full_name', 'city', 'is_default']
    list_filter = ['is_default', 'city', 'state']
    search_fields = ['user__username', 'full_name', 'city']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'quantity', 'price']
    list_filter = ['order__status']
    search_fields = ['order__order_id', 'product_name']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'alt_text']
    list_filter = ['product']