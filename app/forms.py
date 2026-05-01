from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()


class UserRegisterForm(UserCreationForm):
    full_name = forms.CharField(max_length=200, required=True)
    phone = forms.CharField(max_length=15, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'phone', 'password1', 'password2']
    
    def save(self, commit=True):
        user = super().save(commit=False)
        full_name = self.cleaned_data.get('full_name')
        if full_name:
            name_parts = full_name.split()
            user.first_name = name_parts[0] if name_parts else ''
            user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        if commit:
            user.save()
        return user


class UserProfileForm(forms.ModelForm):
    full_name = forms.CharField(max_length=200, required=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'dob', 'gender']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['full_name'].initial = f"{self.instance.first_name} {self.instance.last_name}".strip()
    
    def save(self, commit=True):
        user = super().save(commit=False)
        full_name = self.cleaned_data.get('full_name')
        if full_name:
            name_parts = full_name.split()
            user.first_name = name_parts[0] if name_parts else ''
            user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        if commit:
            user.save()
        return user


class ReviewForm(forms.ModelForm):
    class Meta:
        from .models import Review
        model = Review
        fields = ['customer_name', 'rating', 'comment']
        widgets = {
            'rating': forms.HiddenInput(),
        }


class ContactForm(forms.ModelForm):
    class Meta:
        from .models import ContactMessage
        model = ContactMessage
        fields = ['full_name', 'email', 'phone', 'subject', 'message']


class NewsletterForm(forms.ModelForm):
    class Meta:
        from .models import NewsletterSubscriber
        model = NewsletterSubscriber
        fields = ['email']


class AddressForm(forms.ModelForm):
    class Meta:
        from .models import Address
        model = Address
        fields = ['name', 'full_name', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'phone', 'is_default']


class PasswordChangeForm(forms.Form):
    current_password = forms.CharField(widget=forms.PasswordInput)
    new_password = forms.CharField(widget=forms.PasswordInput, min_length=6)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    
    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get('new_password')
        confirm_password = cleaned_data.get('confirm_password')
        if new_password and confirm_password and new_password != confirm_password:
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data