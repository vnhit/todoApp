from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(source="avatar_url", max_length=2048, allow_blank=True, required=False,
                                   validators=[URLValidator(schemes=["http", "https"])])

    class Meta:
        model = User
        fields = ["id", "email", "name", "avatar"]
        read_only_fields = ["id", "email"]


def check_password(password, user):
    try:
        password_validation.validate_password(password, user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(exc.messages)
    return password


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, trim_whitespace=False, max_length=128)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email này đã được đăng ký.")
        return email

    def validate(self, attrs):
        try:
            check_password(attrs["password"], User(email=attrs["email"], name=attrs["name"]))
        except serializers.ValidationError as exc:
            raise serializers.ValidationError({"password": exc.detail})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(trim_whitespace=False, max_length=128, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(trim_whitespace=False, max_length=128, write_only=True)
    new_password = serializers.CharField(trim_whitespace=False, max_length=128, write_only=True)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Mật khẩu hiện tại không đúng.")
        return value

    def validate_new_password(self, value):
        return check_password(value, self.context["request"].user)
